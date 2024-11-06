import { Viewer, Worker } from "@react-pdf-viewer/core"

function Swiper() {
  return (
    <>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl="https://rf-static.ams3.digitaloceanspaces.com/payout-dev/ams3/2024-10-29/payouts/receipts/1fcc306a-e271-4072-9665-71a5d49b5b6c.pdf" />;
      </Worker>
    </>
  )
}

export default Swiper