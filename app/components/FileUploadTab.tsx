'use client'

import { useState, useRef } from 'react'
import { Paper, AnalysisResult } from '@/app/types'

interface FileUploadTabProps {
  onAnalysisStart?: () => void
  onAnalysisComplete?: (analysis: AnalysisResult) => void
  onError?: (error: string) => void
}

export default function FileUploadTab({
  onAnalysisStart,
  onAnalysisComplete,
  onError,
}: FileUploadTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragOverRef = useRef(false)

  const acceptedFormats = ['.pdf', '.txt', '.doc', '.docx']

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(extension)) {
      const err = `Unsupported file format. Please upload: ${acceptedFormats.join(', ')}`
      setError(err)
      onError?.(err)
      return
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      const err = 'File is too large. Maximum file size is 50MB'
      setError(err)
      onError?.(err)
      return
    }

    await uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      onAnalysisStart?.()

      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 30, 90))
      }, 200)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result: AnalysisResult = await response.json()
      setUploadProgress(100)

      // Reset form
      setTimeout(() => {
        setFileName('')
        setIsUploading(false)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onAnalysisComplete?.(result)
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload'
      setError(errorMessage)
      onError?.(errorMessage)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = true
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = false
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = false

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg p-8">
      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-200 flex gap-3 justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="flex-shrink-0 text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0])
          }
        }}
        disabled={isUploading}
        className="hidden"
      />

      {isUploading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-accent-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{fileName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing document...</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-dark-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent-blue h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-12 text-center cursor-pointer hover:border-accent-blue dark:hover:border-accent-blue transition-colors hover:bg-gray-50 dark:hover:bg-dark-700/50"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path d="M28 8H12a4 4 0 00-4 4v20a4 4 0 004 4h24a4 4 0 004-4V20" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <path d="M32 4v12m0 0l-4-4m4 4l4-4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upload a Research Document
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Drag and drop your file here or click to browse
          </p>

          <div className="bg-gray-100 dark:bg-dark-700 rounded px-4 py-2 inline-block">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
            Maximum file size: 50MB
          </p>
        </div>
      )}

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-200">
          <strong>How it works:</strong> Upload your research document and our AI will analyze it for credibility, bias, and key findings.
          The analysis results can be bookmarked and compared with other papers.
        </p>
      </div>
    </div>
  )
}
