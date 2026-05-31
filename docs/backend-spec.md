# ChatReady --- Backend & API Specification

## Stack

-   Python
-   FastAPI
-   MarkItDown
-   tiktoken
-   Hosted on Railway

## Responsibilities

-   Validate uploads
-   Process files
-   Convert to Markdown
-   Estimate tokens
-   Calculate token reduction
-   Delete temp files

## Supported Inputs (V1)

Documents: PDF, DOCX, TXT, MD, RTF

Slides: PPTX

Spreadsheets: XLSX, CSV

Structured: JSON, XML, HTML

Images: PNG, JPG, JPEG, WEBP

URLs: YouTube, webpage/article URL

## API

### POST /convert

Purpose: Convert uploaded files into Markdown.

Request: multipart/form-data

Fields: - file

Response:

``` json
{
  "success": true,
  "markdown": "# Example",
  "rawTokenCount": 8000,
  "markdownTokenCount": 4500,
  "reductionPercent": 43,
  "fileType": "pdf",
  "processingTimeMs": 800
}
```

Errors: - unsupported_file - file_too_large - conversion_failed

### POST /convert-url

Purpose: Convert YouTube/webpage URLs.

Request:

``` json
{
  "url": "https://example.com"
}
```

Response: Same schema as `/convert`.

### GET /health

Response:

``` json
{
  "status": "ok"
}
```

## Processing Flow

1.  Receive file/URL
2.  Validate type
3.  Save temp file
4.  Convert using MarkItDown
5.  Estimate tokens using tiktoken
6.  Calculate reduction
7.  Return markdown
8.  Delete temporary files

## Token Reduction Formula

((rawTokens - markdownTokens) / rawTokens) \* 100

## Security Rules

-   MIME validation
-   File size limits
-   Temporary storage only
-   Auto-delete files
-   Rate limiting
-   Sanitize filenames

## Logging

Allowed: - file type - processing duration - success/failure

Never log: - file contents - extracted markdown - user document text

## Constraints

No auth. No database. No queues. No analytics SDK. Single service
architecture.
