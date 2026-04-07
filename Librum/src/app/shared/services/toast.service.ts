import { Injectable } from '@angular/core';
import { ToastComponent } from '../component/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponent: ToastComponent | null = null;

  setToastComponent(component: ToastComponent) {
    this.toastComponent = component;
  }

  showToast(type: 'success' | 'error' | 'info' | 'warning', message: string, title?: string, duration?: number) {
    this.toastComponent?.showToast(type, message, title, duration);
  }

  showSuccess(message: string, title?: string, duration?: number) {
    this.showToast('success', message, title, duration);
  }

  showError(message: string, title?: string, duration?: number) {
    this.showToast('error', message, title, duration);
  }

  showInfo(message: string, title?: string, duration?: number) {
    this.showToast('info', message, title, duration);
  }

  showWarning(message: string, title?: string, duration?: number) {
    this.showToast('warning', message, title, duration);
  }
}