#arteigenschaften.ch, Strukturanpassung

Diese Anwendung nimmt die Dokumente von arteigenschaften.ch (Version 1) und baut sie für arteigenschaften.ch Version 3 um:

Neu ist v.a.:

- Taxonomien sind wie Eigenschaftensammlungen und Beziehungssammlungen ein Array
- Jede Taxonomie beschreibt in den Eigenschaften die hierarchische Position ihres Objekts

### neue Struktur eines Objekts:

    _id
    _rev
    Gruppe
    Typ
    Taxonomien
      Name
      Beschreibung
      Datenstand
      Link
      Standardtaxonomie
      Eigenschaften
        … (abhängig von der Taxonomie)
        Hierarchie
          Name
          GUID
    Eigenschaftensammlungen
    Beziehungssammlungen

Jede Taxonomie, Eigenschaften- und Beziehungssammlung und jeder Lebensraum erhält neu: "Organisation mit Schreibrecht": "FNS Kt. ZH"