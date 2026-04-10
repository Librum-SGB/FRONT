import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  toasts: { id: number; type: string; message: string; title?: string; show: boolean }[] = [];
  private toastId = 0;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.setToastComponent(this);
  }

  showToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
  const id = ++this.toastId;

  this.toasts.push({ id, type, message, show: true });

  setTimeout(() => {
    this.removeToast(id);
  }, 3000);
}

  removeToast(id: number) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'error': return 'bi-x-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'info': return 'bi-info-circle-fill';
      default: return 'bi-bell-fill';
    }
  }

  getToastClass(type: string): string {
    switch (type) {
      case 'success': return 'bg-success';
      case 'error': return 'bg-danger';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}