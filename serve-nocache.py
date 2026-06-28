#!/usr/bin/env python3
"""Simple HTTP server with no-cache headers for development."""
import http.server
import os

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

os.chdir('/mnt/d/Crab Tank Dir/projects/agent-pet')
http.server.HTTPServer(('0.0.0.0', 8765), NoCacheHandler).serve_forever()