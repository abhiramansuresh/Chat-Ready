import ipaddress
import socket
from urllib.parse import urlparse

from app.core.errors import ChatReadyError, FRIENDLY_URL_ERROR

ALLOWED_URL_SCHEMES = {"http", "https"}


def validate_url(url: str) -> str:
    normalized_url = url.strip()
    parsed_url = urlparse(normalized_url)

    if parsed_url.scheme not in ALLOWED_URL_SCHEMES:
        raise _invalid_url_error()

    if not parsed_url.hostname:
        raise _invalid_url_error()

    require_public_url(normalized_url)

    return normalized_url


def require_public_url(url: str) -> None:
    """Reject URLs that resolve into the server's own network.

    Without this, /convert-url is an open proxy into the deployment's private
    network and the cloud metadata service. Redirects are checked separately by
    the fetcher, since a public host can redirect to a private one.

    ponytail: resolves once here and requests resolves again, so a hostile DNS
    server could in principle answer differently the second time. Closing that
    needs an IP-pinned transport adapter; not worth it until this is a target.
    """
    hostname = urlparse(url).hostname

    if not hostname:
        raise _invalid_url_error()

    addresses = _resolve(hostname)

    if not addresses or not all(_is_public(address) for address in addresses):
        # Deliberately the same message as a malformed URL: a distinct error
        # would turn this endpoint into an internal-network port scanner.
        raise _invalid_url_error()


def _resolve(hostname: str) -> list[ipaddress.IPv4Address | ipaddress.IPv6Address]:
    literal = _parse_ip(hostname.strip("[]"))

    if literal is not None:
        return [literal]

    try:
        address_infos = socket.getaddrinfo(
            hostname,
            None,
            proto=socket.IPPROTO_TCP,
        )
    except (socket.gaierror, UnicodeError):
        return []

    addresses = [_parse_ip(info[4][0]) for info in address_infos]

    # A single unparseable answer fails the whole check: unknown means blocked.
    return [] if any(address is None for address in addresses) else addresses  # type: ignore[misc]


def _parse_ip(value: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    try:
        # getaddrinfo returns scoped IPv6 such as "fe80::1%en0".
        return ipaddress.ip_address(value.split("%", maxsplit=1)[0])
    except ValueError:
        return None


def _is_public(address: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    mapped_ipv4 = getattr(address, "ipv4_mapped", None)

    if mapped_ipv4 is not None:
        return _is_public(mapped_ipv4)

    return not (
        address.is_private
        or address.is_loopback
        or address.is_link_local
        or address.is_multicast
        or address.is_reserved
        or address.is_unspecified
    )


def _invalid_url_error() -> ChatReadyError:
    return ChatReadyError(
        code="unsupported_url",
        message=FRIENDLY_URL_ERROR,
        status_code=400,
    )
