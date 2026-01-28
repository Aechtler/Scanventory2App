# ScanApp - Marktwert-Analyzer

## Projektübersicht

Eine mobile Scan-Applikation zur automatischen Erkennung von Gegenständen und Analyse deren aktuellen Marktwerts auf dem deutschen Markt.

---

## Vision

Mit der ScanApp können Nutzer ihre Besitztümer schnell und unkompliziert scannen, um den aktuellen Marktwert auf verschiedenen deutschen Handelsplattformen zu ermitteln. Die App kombiniert Bilderkennung mittels KI mit Echtzeit-Marktdatenanalyse.

---

## Kernfunktionen

### 1. Item-Erfassung

#### 1.1 Kamera-Scan
- Echtzeit-Kameraaufnahme über die Smartphone-Kamera
- Automatische Bildoptimierung (Belichtung, Schärfe, Zuschnitt)
- Möglichkeit mehrere Aufnahmen pro Item zu machen für bessere Erkennung

#### 1.2 Bild-Upload
- Upload von Bildern aus der Galerie
- Unterstützung gängiger Formate (JPG, PNG, HEIC)
- Drag & Drop Funktionalität (Web-Version/Testmodus)
- **Priorität für Entwicklungsphase:** Bildupload als primäre Testmethode

---

### 2. KI-Bilderkennung

#### 2.1 Bildanalyse
- Automatische Objekterkennung im Bild
- Kategorisierung des Items (z.B. Elektronik, Kleidung, Sammlerstück, Möbel)
- Extraktion von erkennbaren Details (Marke, Modell, Zustand)

#### 2.2 Ergebnis-Validierung
- Anzeige von **mehreren möglichen Treffern** als Auswahl
- Jeder Treffer mit:
  - Vorschaubild (Referenzbild aus Datenbank/Web)
  - Produktname
  - Konfidenz-Score der KI
- Nutzer kann den korrekten Treffer auswählen
- Option "Keiner der Vorschläge" für manuelle Eingabe
- Feedback-Loop: Nutzerauswahl verbessert zukünftige Erkennung

---

### 3. Marktanalyse

#### 3.1 Unterstützte Plattformen
| Plattform | Datenquelle | Priorität |
|-----------|-------------|-----------|
| **eBay.de** | Aktive Angebote + Verkaufte Artikel | Hoch |
| **Kleinanzeigen** | Aktuelle Inserate | Hoch |
| **Amazon.de** | Neu- & Gebrauchtpreise | Mittel |
| **Idealo.de** | Preisvergleich | Mittel |

#### 3.2 Preisanalyse
- **Durchschnittspreis:** Mittelwert aller gefundenen Angebote
- **Preisspanne:** Minimum bis Maximum
- **Median-Preis:** Robuster gegen Ausreißer
- **Trend-Indikator:** Preisentwicklung der letzten 30 Tage (falls Daten verfügbar)

#### 3.3 Detailansicht pro Plattform
- Anzahl der aktiven Angebote
- Günstigstes/Teuerstes Angebot mit Direktlink
- Verkaufte Artikel (eBay) für realistischen Marktwert
- Durchschnittliche Verkaufsdauer

---

### 4. Scan-Verlauf (History)

#### 4.1 Verlaufsübersicht
- Chronologische Liste aller gescannten Items
- Vorschaubild + Itemname + Datum
- Letzter ermittelter Marktwert

#### 4.2 Verlaufs-Funktionen
- Erneute Marktanalyse für gespeicherte Items
- Preisentwicklung über Zeit (bei mehrfacher Analyse)
- Items löschen oder als Favorit markieren
- Export-Funktion (CSV/PDF)

#### 4.3 Datenspeicherung
- Lokale Speicherung auf dem Gerät
- Optional: Cloud-Sync für geräteübergreifende Nutzung

---

## Technische Architektur

### Frontend (Mobile App)
```
┌─────────────────────────────────────────┐
│            Mobile App (UI)              │
├─────────────────────────────────────────┤
│  • Kamera-Integration                   │
│  • Bildupload                           │
│  • Ergebnis-Anzeige                     │
│  • Verlaufs-Verwaltung                  │
└─────────────────────────────────────────┘
```

### Backend (Server)
```
┌─────────────────────────────────────────┐
│            Backend Server               │
├─────────────────────────────────────────┤
│  • Bild-Empfang & Preprocessing         │
│  • KI-Service (Bilderkennung)           │
│  • Marktdaten-Aggregator                │
│  • Datenbank (Verlauf, Nutzer)          │
└─────────────────────────────────────────┘
```

### Externe Services
```
┌─────────────────────────────────────────┐
│         Externe Schnittstellen          │
├─────────────────────────────────────────┤
│  • Vision API (Google/OpenAI/Custom)    │
│  • eBay API                             │
│  • Web-Scraping (Kleinanzeigen, Idealo) │
│  • Amazon Product API                   │
└─────────────────────────────────────────┘
```

---

## Entwicklungsphasen

### Phase 1: MVP (Minimum Viable Product)
- [x] Projektsetup und Grundstruktur
- [x] Bildupload-Funktion (inkl. Kamera)
- [x] Integration einer Vision-API für Bilderkennung (Google Gemini)
- [x] Einfache Produktsuche auf eBay (Mock-Daten, umstellbar)
- [x] Basis-Preisanzeige
- [x] Einfacher Verlauf (lokal gespeichert)

### Phase 2: Erweiterung
- [x] Kamera-Integration (bereits in Phase 1 implementiert)
- [x] Mehrere Treffer-Auswahl mit Vorschaubildern
- [x] Integration weiterer Plattformen (Kleinanzeigen, Amazon - Mock)
- [x] Detaillierte Preisstatistiken
- [ ] Verbessertes UI/UX (Animationen, Skeleton Loading)

### Phase 3: Optimierung
- [ ] Idealo-Integration
- [ ] Preistrend-Analyse
- [ ] Export-Funktionen
- [ ] Performance-Optimierung
- [ ] Offline-Modus für Verlauf

### Phase 4: Premium-Features (Optional)
- [ ] Cloud-Sync
- [ ] Preisalarme (Benachrichtigung bei Preisänderung)
- [ ] Sammlungs-Verwaltung mit Gesamtwert
- [ ] Verkaufsassistent (optimaler Verkaufspreis-Vorschlag)

---

## Technologie-Stack (Vorschlag)

### Option A: Cross-Platform
| Komponente | Technologie |
|------------|-------------|
| Mobile App | React Native / Flutter |
| Backend | Node.js / Python (FastAPI) |
| Datenbank | PostgreSQL / SQLite (lokal) |
| KI | OpenAI Vision API / Google Cloud Vision |

### Option B: Native iOS (falls nur iPhone)
| Komponente | Technologie |
|------------|-------------|
| Mobile App | Swift / SwiftUI |
| Backend | Node.js / Python |
| Datenbank | Core Data (lokal) + PostgreSQL (Server) |
| KI | Apple Vision Framework + Cloud API |

---

## Datenmodell

### Item
```
{
  id: UUID,
  image_url: String,
  recognized_name: String,
  category: String,
  user_confirmed: Boolean,
  created_at: DateTime,
  updated_at: DateTime
}
```

### MarketAnalysis
```
{
  id: UUID,
  item_id: UUID,
  platform: String,
  average_price: Decimal,
  min_price: Decimal,
  max_price: Decimal,
  offer_count: Integer,
  analyzed_at: DateTime
}
```

### ScanHistory
```
{
  id: UUID,
  item_id: UUID,
  scan_date: DateTime,
  total_estimated_value: Decimal
}
```

---

## Offene Fragen / Entscheidungen

1. **Plattform:** iOS only, Android only, oder Cross-Platform?
2. **KI-Service:** Eigenes Modell trainieren oder Cloud-API nutzen?
3. **Monetarisierung:** Kostenlos, Freemium, oder einmaliger Kauf?
4. **Datenschutz:** Wie lange werden Bilder gespeichert? Lokale vs. Cloud-Verarbeitung?
5. **API-Zugang:** Offizielle APIs vs. Web-Scraping (rechtliche Aspekte)?

---

## Nächste Schritte

1. Entscheidung über Tech-Stack treffen
2. Projektstruktur anlegen
3. Einfachen Bildupload implementieren
4. Vision-API testen und integrieren
5. Erste eBay-Suchabfrage implementieren