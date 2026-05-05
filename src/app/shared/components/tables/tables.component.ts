import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TableColumn {
  field: string;
  label: string;
}

@Component({
  selector: 'app-tables',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnInit {
  @Input() columns: TableColumn[] = [];
  @Input() tableData: any[] = [];
  @Input() pageSize: number = 10;

  constructor() {}

  ngOnInit(): void {
    if (this.columns.length === 0) {
      this.columns = Object.keys(this.tableData[0] ?? {}).map(field => ({ field, label: field }));
    }
  }

  onSort(field: string): void {
    // Implement sorting logic
  }

  onEdit(rowId: string): void {
    // Implement edit logic
  }

  onDelete(rowId: string): void {
    // Implement delete logic
  }
}
