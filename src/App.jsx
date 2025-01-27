import React, { useState } from "react";

// Initial  data with parent and child rows
const initialData = [
  {
    id: "electronics",
    label: "Electronics",
    value: 1400,
    originalValue: 1400,
    children: [
      { id: "phones", label: "-- Phones", value: 800, originalValue: 800 },
      { id: "laptops", label: "-- Laptops", value: 700, originalValue: 700 },
    ],
  },
  {
    id: "furniture",
    label: "Furniture",
    value: 1000,
    originalValue: 1000,
    children: [
      { id: "tables", label: "-- Tables", value: 300, originalValue: 300 },
      { id: "chairs", label: "-- Chairs", value: 700, originalValue: 700 },
    ],
  },
];

const App = () => {
  const [data, setData] = useState(initialData);

  // Func to update row value and recalculate the hierarchy
  const updateRowValue = (id, value, type) => {
    const updateValues = (rows) => {
      return rows.map((row) => {
        if (row.id === id) {
          if (type === "percentage") {
            row.value += (row.value * value) / 100;
          } else if (type === "absolute") {
            row.value = value;
          }
          row.variance = ((row.value - row.originalValue) / row.originalValue) * 100;

          // Updating children proportionally when updating a subtotal
          if (row.children && type === "absolute") {
            const childTotal = row.children.reduce((sum, child) => sum + child.value, 0);
            row.children = row.children.map((child) => {
              const proportion = child.value / childTotal;
              child.value = row.value * proportion;
              child.variance = ((child.value - child.originalValue) / child.originalValue) * 100;
              return child;
            });
          }
        }

        if (row.children) {
          row.children = updateValues(row.children);
          row.value = row.children.reduce((sum, child) => sum + child.value, 0);
          row.variance = ((row.value - row.originalValue) / row.originalValue) * 100;
        }

        return row;
      });
    };

    setData(updateValues(data));
  };

  return (
    <div className="app">
      <h1>Hierarchical Table React - Raghunath S</h1>
      <Table data={data} onUpdate={updateRowValue} />
    </div>
  );
};

const Table = ({ data, onUpdate }) => {

  return (
    <table>
      <thead>
        <tr>
          <th>Label</th>
          <th>Value</th>
          <th>Input</th>
          <th>Allocation %</th>
          <th>Allocation Val</th>
          <th>Variance %</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <Row key={row.id} row={row} onUpdate={onUpdate} level={0} />
        ))}
      </tbody>
    </table>
  );
};

const Row = ({ row, onUpdate, level }) => {
  const [inputValue, setInputValue] = useState("");

  const handleUpdate = (type) => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      onUpdate(row.id, value, type);
      setInputValue("");
    }
  };

  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${level * 10}px` }}>{row.label}</td>
        <td>{row.value.toFixed(2)}</td>
        <td>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </td>
        <td>
          <button onClick={() => handleUpdate("percentage")}>%</button>
        </td>
        <td>
          <button onClick={() => handleUpdate("absolute")}>Val</button>
        </td>
        <td>{row.variance ? `${row.variance.toFixed(2)}%` : "0%"}</td>
      </tr>
      {row.children &&
        row.children.map((child) => (
          <Row key={child.id} row={child} onUpdate={onUpdate} level={level + 1} />
        ))}
    </>
  );
};

export default App;