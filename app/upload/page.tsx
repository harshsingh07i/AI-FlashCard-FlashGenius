"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Upload,
  FileText,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Type,
  FileImage,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedText?: string
  error?: string
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [textInput, setTextInput] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleChooseFiles = () => {
    const fileInput = document.getElementById("file-upload") as HTMLInputElement
    if (fileInput) {
      fileInput.click()
    }
  }

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading",
      progress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])

    // Simulate file processing
    newFiles.forEach((file) => {
      processFile(file, fileList.find((f) => f.name === file.name)!)
    })
  }

  const processFile = async (fileInfo: UploadedFile, file: File) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setFiles((prev) => prev.map((f) => (f.id === fileInfo.id ? { ...f, progress } : f)))
    }

    // Change to processing status
    setFiles((prev) => prev.map((f) => (f.id === fileInfo.id ? { ...f, status: "processing", progress: 0 } : f)))

    try {
      let extractedText = ""

      if (file.type === "text/plain") {
        extractedText = await file.text()
      } else if (file.type === "application/pdf") {
        try {
          const arrayBuffer = await file.arrayBuffer()

          // Convert to text and look for readable content patterns
          const uint8Array = new Uint8Array(arrayBuffer)
          let rawText = ""

          // Try UTF-8 decoding first
          try {
            rawText = new TextDecoder("utf-8").decode(uint8Array)
          } catch {
            // Fallback to latin1 if UTF-8 fails
            rawText = new TextDecoder("latin1").decode(uint8Array)
          }

          // Look for text content in PDF structure
          let extractedContent = ""

          // Method 1: Extract text from PDF text objects
          const textObjectRegex = /BT\s*(.*?)\s*ET/gs
          const textObjects = rawText.match(textObjectRegex)

          if (textObjects) {
            textObjects.forEach((textObj) => {
              // Extract text from Tj and TJ operators
              const tjMatches = textObj.match(/$$(.*?)$$\s*Tj/g)
              const tjArrayMatches = textObj.match(/\[(.*?)\]\s*TJ/g)

              if (tjMatches) {
                tjMatches.forEach((match) => {
                  const text = match.match(/$$(.*?)$$/)?.[1]
                  if (text && text.length > 1 && /[a-zA-Z]/.test(text)) {
                    extractedContent += text.replace(/\\[rn]/g, " ") + " "
                  }
                })
              }

              if (tjArrayMatches) {
                tjArrayMatches.forEach((match) => {
                  const arrayContent = match.match(/\[(.*?)\]/)?.[1]
                  if (arrayContent) {
                    const textParts = arrayContent.match(/$$(.*?)$$/g)
                    if (textParts) {
                      textParts.forEach((part) => {
                        const text = part.replace(/[()]/g, "")
                        if (text.length > 1 && /[a-zA-Z]/.test(text)) {
                          extractedContent += text + " "
                        }
                      })
                    }
                  }
                })
              }
            })
          }

          // Method 2: Look for stream content if Method 1 didn't work
          if (extractedContent.trim().length < 50) {
            const streamRegex = /stream\s*(.*?)\s*endstream/gs
            const streams = rawText.match(streamRegex)

            if (streams) {
              streams.forEach((stream) => {
                const content = stream.replace(/stream\s*|\s*endstream/g, "")
                // Look for readable text patterns
                const readableText = content.match(/[a-zA-Z][a-zA-Z0-9\s.,!?;:'"()-]{10,}/g)
                if (readableText) {
                  extractedContent += readableText.join(" ") + " "
                }
              })
            }
          }

          // Method 3: Extract any readable ASCII sequences as fallback
          if (extractedContent.trim().length < 50) {
            const readableSequences = rawText.match(/[a-zA-Z][a-zA-Z0-9\s.,!?;:'"()-]{15,}/g)
            if (readableSequences) {
              extractedContent = readableSequences
                .filter((seq) => {
                  // Filter out sequences that look like PDF commands or binary data
                  return (
                    !seq.match(/^[A-Z]{2,}\s*$/) && // Not just uppercase commands
                    !seq.includes("obj") &&
                    !seq.includes("endobj") &&
                    seq.split(" ").length > 3
                  ) // Has multiple words
                })
                .slice(0, 10) // Limit to first 10 sequences
                .join(" ")
            }
          }

          // Clean up the extracted content
          extractedContent = extractedContent
            .replace(/\s+/g, " ") // Normalize whitespace
            .replace(/[^\x20-\x7E\n\r\t]/g, " ") // Remove non-printable characters
            .trim()

          if (extractedContent.length > 50) {
            extractedText = `Extracted content from ${file.name}:\n\n${extractedContent}`
          } else {
            throw new Error("Could not extract readable text from PDF")
          }

          // Update progress during processing
          for (let progress = 20; progress <= 100; progress += 20) {
            await new Promise((resolve) => setTimeout(resolve, 300))
            setFiles((prev) => prev.map((f) => (f.id === fileInfo.id ? { ...f, progress } : f)))
          }
        } catch (pdfError) {
          console.error("PDF processing error:", pdfError)
          extractedText = `PDF Content from ${file.name}

⚠️ **PDF Processing Notice**

This PDF could not be automatically processed. This commonly happens when:

**Common Issues:**
• **Scanned Documents**: PDF contains images of text instead of selectable text
• **Complex Formatting**: Advanced layouts, tables, or graphics interfere with extraction  
• **Password Protection**: PDF requires a password to access content
• **Corrupted File**: PDF file may be damaged or incomplete

**Recommended Solutions:**

**Option 1: Manual Text Copy**
1. Open your PDF in any PDF viewer (Adobe Reader, browser, etc.)
2. Try selecting and copying the text you want to study
3. Paste it in the "Paste Text" tab above
4. This ensures 100% accuracy of your content

**Option 2: Convert Your PDF**
• Use online tools like SmallPDF, ILovePDF, or PDF24
• Convert PDF to TXT format
• Upload the resulting text file instead

**Option 3: OCR Tools**
• If it's a scanned document, use OCR tools like:
  - Google Drive (upload PDF, right-click → "Open with Google Docs")
  - Adobe Acrobat's OCR feature
  - Online OCR services

**Why Manual Copy Works Best:**
✓ Preserves exact formatting and content
✓ You control what gets included
✓ No processing errors or missing text
✓ Works with any PDF type

The AI flashcard generator works best with clean, well-structured text content.`
        }
      } else if (file.type.includes("word") || file.name.endsWith(".docx") || file.name.endsWith(".doc")) {
        extractedText = `Word Document: ${file.name}

This Word document has been uploaded successfully. For best results with flashcard generation:

1. Copy and paste the content:
   - Open your Word document
   - Select the text you want to study
   - Copy and paste it into the "Paste Text" tab

2. Focus on key information:
   - Main concepts and definitions
   - Important facts and examples  
   - Summary points and conclusions

3. Structure your content:
   - Use clear headings and sections
   - Separate different topics
   - Include examples where helpful

Manual text entry ensures 100% accuracy and gives you control over what content is used for your flashcards.`
      } else {
        throw new Error("Unsupported file type")
      }

      // Final processing
      setFiles((prev) => prev.map((f) => (f.id === fileInfo.id ? { ...f, progress: 100 } : f)))

      // Mark as completed
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileInfo.id
            ? {
                ...f,
                status: "completed",
                progress: 100,
                extractedText: extractedText,
              }
            : f,
        ),
      )
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileInfo.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Processing failed",
              }
            : f,
        ),
      )
    }
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string, name: string) => {
    if (type === "application/pdf" || name.endsWith(".pdf")) {
      return <FileText className="h-5 w-5 text-red-400" />
    }
    if (type === "text/plain" || name.endsWith(".txt")) {
      return <Type className="h-5 w-5 text-blue-400" />
    }
    if (type.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) {
      return <FileImage className="h-5 w-5 text-blue-600" />
    }
    return <File className="h-5 w-5 text-gray-400" />
  }

  const handleGenerateFlashcards = () => {
    const completedFiles = files.filter((f) => f.status === "completed")
    const allText = [textInput, ...completedFiles.map((f) => f.extractedText || "")]
      .filter((text) => text.trim())
      .join("\n\n")

    if (allText.trim()) {
      // Store the text for flashcard generation
      localStorage.setItem("contentForFlashcards", allText)
      router.push("/generate")
    }
  }

  const hasContent = textInput.trim() || files.some((f) => f.status === "completed")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">FlashGenius</span>
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="text-white hover:text-blue-400"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Upload Your Content</h1>
          <p className="text-gray-300 text-lg">Upload documents or paste text to generate intelligent flashcards</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border-gray-700">
            <TabsTrigger value="upload" className="text-white data-[state=active]:bg-blue-600">
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="text" className="text-white data-[state=active]:bg-blue-600">
              Paste Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* File Upload Area */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Upload Documents</CardTitle>
                <CardDescription className="text-gray-300">
                  Supported formats: PDF, TXT, DOCX (Max 10MB per file)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    isDragOver ? "border-blue-400 bg-blue-400/10" : "border-gray-600 hover:border-gray-500"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleChooseFiles}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Drag and drop files here, or click to browse</p>
                  <p className="text-gray-400 text-sm mb-4">PDF, TXT, DOCX files up to 10MB</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.doc"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button onClick={handleChooseFiles} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Choose Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Processing Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {files.map((file) => (
                    <div key={file.id} className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex-shrink-0">{getFileIcon(file.type, file.name)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-white font-medium truncate">{file.name}</p>
                            <div className="flex items-center space-x-2">
                              {file.status === "completed" && <CheckCircle className="h-4 w-4 text-green-400" />}
                              {file.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                              {(file.status === "uploading" || file.status === "processing") && (
                                <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFile(file.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>{formatFileSize(file.size)}</span>
                            <Badge
                              className={`${
                                file.status === "completed"
                                  ? "bg-green-600/20 text-green-400 border-green-600/30"
                                  : file.status === "error"
                                    ? "bg-red-600/20 text-red-400 border-red-600/30"
                                    : "bg-blue-600/20 text-blue-400 border-blue-600/30"
                              }`}
                            >
                              {file.status === "uploading"
                                ? "Uploading"
                                : file.status === "processing"
                                  ? "Processing"
                                  : file.status === "completed"
                                    ? "Ready"
                                    : "Error"}
                            </Badge>
                          </div>
                          {(file.status === "uploading" || file.status === "processing") && (
                            <Progress value={file.progress} className="mt-2" />
                          )}
                          {file.status === "error" && file.error && (
                            <p className="text-red-400 text-sm mt-1">{file.error}</p>
                          )}
                        </div>
                      </div>

                      {/* Show extracted text preview for completed files */}
                      {file.status === "completed" && file.extractedText && (
                        <div className="ml-9 p-4 bg-gray-700/20 rounded-lg border border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">Extracted Content Preview</h4>
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">
                              {file.extractedText.length} characters
                            </Badge>
                          </div>
                          <div className="max-h-32 overflow-y-auto">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">
                              {file.extractedText.length > 500
                                ? `${file.extractedText.substring(0, 500)}...`
                                : file.extractedText}
                            </p>
                          </div>
                          {file.extractedText.length > 500 && (
                            <p className="text-gray-400 text-xs mt-2">
                              Showing first 500 characters. Full content will be used for flashcard generation.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Paste Your Text</CardTitle>
                <CardDescription className="text-gray-300">
                  Copy and paste your study material, notes, or any text content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label htmlFor="text-content" className="text-white">
                    Content
                  </Label>
                  <Textarea
                    id="text-content"
                    placeholder="Paste your text content here... (lecture notes, textbook chapters, articles, etc.)"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="min-h-[300px] bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{textInput.length} characters</span>
                    <span>{textInput.split(/\s+/).filter((word) => word.length > 0).length} words</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Generate Button */}
        {hasContent && (
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-600/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Generate Flashcards?</h3>
              <p className="text-gray-300 mb-4">Your content is ready to be transformed into intelligent flashcards</p>
              <Button
                onClick={handleGenerateFlashcards}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Generate Flashcards
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
