// Static HTML content embedded in the worker
export const staticFiles = {
  'index.html': `<!-- Your index.html content here -->`,
  'user-dashboard.html': `<!-- Your user-dashboard.html content here -->`, 
  'admin-login.html': `<!-- Your admin-login.html content here -->`,
  'admin-dashboard.html': `<!-- Your admin-dashboard.html content here -->`
}

export function serveStaticFile(fileName: string) {
  return new Response(staticFiles[fileName], {
    headers: { 'Content-Type': 'text/html' }
  })
}