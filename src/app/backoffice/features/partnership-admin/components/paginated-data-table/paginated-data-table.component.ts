import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-paginated-data-table',
  templateUrl: './paginated-data-table.component.html',
})
export class PaginatedDataTableComponent {
  @Input() columns: { key: string; label: string }[] = [];
  @Input() rows: Record<string, unknown>[] = [];
  @Input() pageSize = 8;
  @Input() searchPlaceholder = 'Rechercher...';
  @Input() searchKeys: string[] = [];
  @Input() showActions = true;
  @Input() showEdit = true;
  @Output() editRow = new EventEmitter<Record<string, unknown>>();
  @Output() deleteRow = new EventEmitter<Record<string, unknown>>();

  search = '';
  page = 1;

  get filtered(): Record<string, unknown>[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter((row) =>
      this.searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)),
    );
  }

  get paged(): Record<string, unknown>[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.pageSize));
  }

  setPage(p: number): void {
    this.page = Math.min(Math.max(1, p), this.totalPages);
  }

  onSearchChange(): void {
    this.page = 1;
  }
}
