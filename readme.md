#arteigenschaften.ch, Strukturanpassung

Diese Anwendung nimmt die Dokumente von arteigenschaften.ch (Version 1) und baut sie für arteigenschaften.ch Version 3 um:

### Neu ist:

- Es gibt Objekte vom Typ "Taxonomie"
- Es gibt Objekte vom Typ "Taxonomie-Objekt"
- In Objekten sind Taxonomien wie Eigenschaftensammlungen und Beziehungssammlungen ein Array
- Jede Taxonomie beschreibt in den Eigenschaften die hierarchische Position ihres Objekts

### Struktur von Objekten des Typs "Taxonomie"

	_id
	_rev
	Gruppe
	Typ: Taxonomie
	Name
	Beschreibung
	Datenstand
	Link
	Standardtaxonomie
	Organisation mit Schreibrecht

### Struktur von Objekten des Typs "Taxonomie-Objekt"
	
	_id
	_rev
	Typ: Taxonomie-Objekt
	Taxonomie: _id der Taxonomie
	Name
	Objekt
	  guid
	  Eigenschaften
		… (abhängig von der Taxonomie)
	parent (null für oberste Ebene)

### neue Struktur von Objekten des Typs "Objekt":

    _id
    _rev
    Gruppe
    Typ: Objekt
    Taxonomien
      IDs der Objekte des Typs "Taxonomie-Objekt",
      welche dieses Objekt in der jeweiligen Taxonomie beschreiben
	  braucht es das????
    Eigenschaftensammlungen
    Beziehungssammlungen

Jede Taxonomie, Eigenschaften- und Beziehungssammlung und jeder Lebensraum erhält neu: "Organisation mit Schreibrecht": "FNS Kt. ZH"