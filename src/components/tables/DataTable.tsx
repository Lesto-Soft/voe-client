import React from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (item: T) => string;
  rowClassName?: (item: T, index: number) => string;
  emptyMessage?: string;
  wrapperClassName?: string;
  tableFixed?: boolean;
}

function DataTable<T>({
  columns,
  data,
  rowKey,
  rowClassName,
  emptyMessage = "Няма намерени резултати.",
  wrapperClassName,
  tableFixed = true,
}: DataTableProps<T>) {
  return (
    <section
      className={
        wrapperClassName ??
        "flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200"
      }
    >
      <div className="overflow-x-auto">
        <table
          className={`min-w-full divide-y divide-gray-200 ${tableFixed ? "table-fixed" : ""}`}
        >
          <thead className="bg-gray-500 sticky top-0 z-10">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  className={`${col.width ?? ""} px-3 py-4 text-center text-sm font-semibold text-white uppercase tracking-wide relative ${col.headerClassName ?? ""}`}
                >
                  {i > 0 && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-1/2 bg-gray-400" />
                  )}
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 border-b border-gray-200">
            {data.map((item, index) => (
              <tr
                key={rowKey(item)}
                className={
                  rowClassName
                    ? rowClassName(item, index)
                    : "transition-colors duration-150 hover:bg-gray-50"
                }
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-4 ${col.cellClassName ?? ""}`}
                  >
                    {col.render(item, index)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default DataTable;
