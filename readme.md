#arteigenschaften.ch, Strukturanpassung

Diese Anwendung nimmt die Dokumente von arteigenschaften.ch (Version 1) und baut sie für arteigenschaften.ch Version 3 um:

### Neu ist:

- es gibt ein Objekt vom Typ "Gruppen"
- es gibt Objekte vom Typ "Taxonomie"
- - es gibt Objekte vom Typ "Taxonomie-Objekt"
- Taxonomien sind wie Eigenschaftensammlungen und Beziehungssammlungen ein Array
- Jede Taxonomie beschreibt in den Eigenschaften die hierarchische Position ihres Objekts

### Struktur des Objekts des Typs "Gruppen"
    
    _id
    _rev
    Typ: Gruppen
	Flora
	  [IDs der Objekte des Typs "Taxonomie", die Flora beshreiben]
	Fauna
	  [IDs der Objekte des Typs "Taxonomie", die Fauna beshreiben]
	Moose
	  [IDs der Objekte des Typs "Taxonomie", die Moose beshreiben]
	Pilze
	  [IDs der Objekte des Typs "Taxonomie", die Pilze beshreiben]
	Lebensräume
	  [IDs der Objekte des Typs "Taxonomie", die Lebensräume beshreiben]

### Struktur von Objekten des Typs "Taxonomie"

	_id: "tax_" & uid(5)
	_rev
	Typ: Taxonomie
	Name
	Beschreibung
	Datenstand
	Link
	Standardtaxonomie
	Organisation mit Schreibrecht
	children

### Struktur von Objekten des Typs "Taxonomie-Objekt"
	
	_id: tax.-ID & "_taxobj_" & uid(5)
	_rev
	Typ: Taxonomie-Objekt
	Name
	children
	Objekt
	  guid
	  Eigenschaften
		… (abhängig von der Taxonomie)

### neue Struktur von Objekten des Typs "Objekt":

    _id
    _rev
    Gruppe
    Typ: Objekt
    Taxonomien
      [IDs der Objekte des Typs "Taxonomie-Objekt", welche dieses Objekt beschreiben]
    Eigenschaftensammlungen
    Beziehungssammlungen

Jede Taxonomie, Eigenschaften- und Beziehungssammlung und jeder Lebensraum erhält neu: "Organisation mit Schreibrecht": "FNS Kt. ZH"