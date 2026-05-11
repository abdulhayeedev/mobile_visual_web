import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { reportsList } from '../../data/mockData.js'

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function ReportsPage() {
  const [genOpen, setGenOpen] = useState(false)

  const columns = [
    { key: 'title', label: 'Report' },
    {
      key: 'generatedAt',
      label: 'Generated',
      render: (row) => formatTime(row.generatedAt),
    },
    { key: 'format', label: 'Format' },
    {
      key: 'actions',
      label: '',
      render: () => (
        <Button type="button" variant="secondary" size="sm">
          Download
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export batch summaries and metric extracts for supervision and publication."
        actions={
          <Button type="button" onClick={() => setGenOpen(true)}>
            Generate report
          </Button>
        }
      />
      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate report"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setGenOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setGenOpen(false)}>
              Queue export
            </Button>
          </>
        }
      >
        <p>
          Choose date range and modules in the full build. For this preview,
          confirming will close the dialog—backend hooks can enqueue PDF/CSV
          bundles here.
        </p>
      </Modal>
      <Card>
        <DataTable columns={columns} rows={reportsList} />
      </Card>
    </div>
  )
}
