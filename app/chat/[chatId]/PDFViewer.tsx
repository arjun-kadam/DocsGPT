interface Props {
  pdfUrl: string
}

const PDFViewer = ({ pdfUrl }: Props) => {
  return (
    <iframe
      src={`https://docs.google.com/gview?url=${pdfUrl}&embedded=true`}
      className="w-full h-full"
    ></iframe>
  )
}

export default PDFViewer
