import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../core/services/category.service';
import { extractList } from '../../core/utils/api-response';

interface CategoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  projectCount: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: CategoryItem[] = [];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: response => {
        this.categories = extractList<any>(response).map(category => ({
          id: String(category.id),
          name: category.name ?? '',
          description: category.description ?? '',
          icon: 'CA',
          projectCount: category.projectCount ?? 0
        }));
      },
      error: error => alert(error.error?.message ?? 'Unable to load categories')
    });
  }

  onAddCategory(): void {
    const name = prompt('Category name');
    if (!name) return;
    const description = prompt('Description') ?? '';

    this.categoryService.createCategory({ name, description }).subscribe({
      next: () => this.loadCategories(),
      error: error => alert(error.error?.message ?? 'Unable to create category')
    });
  }

  onEditCategory(categoryId: string): void {
    const category = this.categories.find(item => item.id === categoryId);
    if (!category) return;
    const name = prompt('Category name', category.name);
    if (!name) return;
    const description = prompt('Description', category.description) ?? '';

    this.categoryService.updateCategory(Number(categoryId), { name, description }).subscribe({
      next: () => this.loadCategories(),
      error: error => alert(error.error?.message ?? 'Unable to update category')
    });
  }

  onDeleteCategory(categoryId: string): void {
    if (!confirm('Delete this category?')) return;

    this.categoryService.deleteCategory(Number(categoryId)).subscribe({
      next: () => this.loadCategories(),
      error: error => alert(error.error?.message ?? 'Unable to delete category')
    });
  }
}
