import { Directive, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';

@Directive({
  selector: '[appPaginate]',
})
export class PaginateDirective implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Input() itemsPerPage = 10;
  @Input() currentPage = 1;

  @Output() paginatedItems = new EventEmitter<any[]>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() paginationInfo = new EventEmitter<{
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
  }>();

  totalPages = 0;

  ngOnInit() {
    this.updatePagination();
  }

  ngOnChanges() {
    this.updatePagination();
  }

  private updatePagination() {
    if (!this.items || this.items.length === 0) {
      this.paginatedItems.emit([]);
      this.totalPages = 0;
      return;
    }

    this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);

    // Ensure current page is within bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.items.length);

    const paginatedData = this.items.slice(startIndex, endIndex);

    this.paginatedItems.emit(paginatedData);
    this.paginationInfo.emit({
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.items.length,
      startIndex: startIndex + 1,
      endIndex,
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
      this.updatePagination();
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }
}
