import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { usersList } from '../../data/mockData.js'

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

export default function UsersPage() {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
          {row.role}
        </span>
      ),
    },
    {
      key: 'lastActive',
      label: 'Last active',
      render: (row) => formatTime(row.lastActive),
    },
    {
      key: 'actions',
      label: '',
      render: () => (
        <Button type="button" variant="ghost" size="sm">
          Manage
        </Button>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Users"
        description="Lab members with access to uploads, jobs, and exports (mock directory)."
        actions={<Button type="button">Invite user</Button>}
      />
      <Card>
        <DataTable columns={columns} rows={usersList} />
      </Card>
    </div>
  )
}
