export const exportCSV = (data, filename = 'export.csv') => {
    const csvRows = [];
  
    // Headers
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Created At'];
    csvRows.push(headers.join(','));
  
    // Rows
    data.forEach(user => {
      const row = [
        `"${user.name || 'N/A'}"`,
        `"${user.email}"`,
        `"${user.phone || 'N/A'}"`,
        `"${user.role}"`,
        `"${user.status}"`,
        `"${new Date(user.createdAt).toLocaleString()}"`
      ];
      csvRows.push(row.join(','));
    });
  
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };  