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

    showToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
        this.toastComponent?.showToast(type, message);
    }

    showSuccess(message: string) {
        this.showToast('success', message);
    }

    showError(message: string) {
        this.showToast('error', message);
    }

    showInfo(message: string) {
        this.showToast('info', message);
    }

    showWarning(message: string) {
        this.showToast('warning', message);
    }
}