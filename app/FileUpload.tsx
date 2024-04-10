'use client'

import { uploadToS3 } from '@/lib/s3'
import { Inbox, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { createChat } from './utils'
import { useRouter } from 'next/navigation'

const FileUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const router = useRouter()

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large (limit: 10MB)')
        return
      }

      try {
        setIsUploading(true)
        const fileKey = await uploadToS3(acceptedFiles[0])
        toast.success('File uploaded successfully!')

        setIsCreatingChat(true)
        const chatId = await createChat(fileKey)
        toast.success('Chat created successfully!')

        router.push(`/chat/${chatId}`)
      } catch (err) {
        toast.error('Something went wrong ...')
        console.log(err)
      } finally {
        setIsUploading(false)
        setIsCreatingChat(false)
      }
    },
  })

  return (
    <div className="p-2 bg-white rounded-2xl">
      <div
        {...getRootProps({
          className:
            'border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col hover:border-blue-300 focus:border-blue-300 focus:border-solid outline-none',
        })}
      >
        <input {...getInputProps()} />
        {isUploading || isCreatingChat ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Uploading...</p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  )
}

export default FileUpload
