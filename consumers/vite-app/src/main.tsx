import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@coderlife/ui-core";
import { DataTable } from "@coderlife/ui-components";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing root element");
}

createRoot(root).render(
  <div style={{ padding: 24 }}>
    <Button variant="contained">Core Button</Button>
    <div style={{ marginTop: 24 }}>
      <DataTable
        rows={[{ id: "1", name: "Ava" }]}
        getRowId={(row) => row.id}
        columns={[{ id: "name", header: "Name", accessor: (row) => row.name }]}
      />
    </div>
  </div>
);
