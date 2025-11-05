'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search } from 'lucide-react';
import type { Submission, FormFieldDB } from '@/lib/types';

interface SubmissionTableProps {
  submissions: Submission[];
  fields: FormFieldDB[];
}

export function SubmissionTable({ submissions, fields }: SubmissionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const filteredSubmissions = submissions.filter((submission) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return JSON.stringify(submission.data).toLowerCase().includes(searchLower);
  });

  const handleExportCSV = () => {
    const headers = ['Submitted At', ...fields.map((f) => f.label)];
    const rows = filteredSubmissions.map((sub) => {
      const row = [new Date(sub.submitted_at).toLocaleString()];
      fields.forEach((field) => {
        const fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
        const value = sub.data[fieldKey];
        if (Array.isArray(value)) {
          row.push(value.join('; '));
        } else {
          row.push(String(value || ''));
        }
      });
      return row;
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-12 text-center">
        <p className="text-gray-500">No submissions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted At</TableHead>
              {fields
                .filter((f) => f.field_type !== 'divider')
                .slice(0, 5)
                .map((field) => (
                  <TableHead key={field.id}>{field.label}</TableHead>
                ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={fields.length + 2} className="text-center text-gray-500">
                  No submissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((submission) => {
                const fieldKey = (field: FormFieldDB) =>
                  field.label.toLowerCase().replace(/\s+/g, '_');
                return (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {new Date(submission.submitted_at).toLocaleString()}
                    </TableCell>
                    {fields
                      .filter((f) => f.field_type !== 'divider')
                      .slice(0, 5)
                      .map((field) => {
                        const value = submission.data[fieldKey(field)];
                        return (
                          <TableCell key={field.id}>
                            {Array.isArray(value) ? value.join(', ') : String(value || '')}
                          </TableCell>
                        );
                      })}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Submission Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted At</p>
                <p className="text-gray-900">
                  {new Date(selectedSubmission.submitted_at).toLocaleString()}
                </p>
              </div>
              {fields
                .filter((f) => f.field_type !== 'divider')
                .map((field) => {
                  const fieldKey = field.label.toLowerCase().replace(/\s+/g, '_');
                  const value = selectedSubmission.data[fieldKey];
                  return (
                    <div key={field.id}>
                      <p className="text-sm font-medium text-gray-600">{field.label}</p>
                      <p className="text-gray-900">
                        {Array.isArray(value) ? value.join(', ') : String(value || '')}
                      </p>
                    </div>
                  );
                })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
