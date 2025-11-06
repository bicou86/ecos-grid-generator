#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serveur simple pour l'interface ECOS Explorer
"""

import http.server
import socketserver
import os
import webbrowser
from threading import Timer

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ECOSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Ajouter les headers CORS pour permettre l'accès aux fichiers CSV
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def open_browser():
    """Ouvre le navigateur après un court délai"""
    webbrowser.open(f'http://localhost:{PORT}')

def main():
    print("\n" + "="*60)
    print("🏥 ECOS EXPLORER - Interface de Consultation Interactive")
    print("="*60 + "\n")

    os.chdir(DIRECTORY)

    with socketserver.TCPServer(("", PORT), ECOSHandler) as httpd:
        print(f"✅ Serveur démarré sur http://localhost:{PORT}")
        print(f"📁 Répertoire servi: {DIRECTORY}")
        print("\n💡 Appuyez sur Ctrl+C pour arrêter le serveur\n")

        # Ouvrir le navigateur après 1 seconde
        timer = Timer(1, open_browser)
        timer.daemon = True
        timer.start()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n⏹️  Arrêt du serveur...")
            httpd.shutdown()
            print("✅ Serveur arrêté avec succès\n")

if __name__ == "__main__":
    main()