import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  completed = [];
  currentTask = "";
  running = false;
  remainingSeconds = 1500;

  start() {
    if (this.currentTask === "") return;
    this.running = true;
    this.storage_set("currentTask");
    this.storage_set("remainingSeconds");
    const interval = setInterval(() => {
      this.remainingSeconds--;
      this.storage_set("remainingSeconds");
      if (this.remainingSeconds === 0) {
        clearInterval(interval);
        this.completed.push({
          task: this.currentTask,
          endTime: Date.now()
        });
        this.storage_set("completed");
        this.running = false;
        this.remainingSeconds = 1500;
        this.currentTask = "";
        this.storage_del("currentTask");
        this.storage_del("remainingSeconds");
      }
    }, 1000);
  }

  clear() {
    this.completed = [];
    this.storage_del("completed");
  }

  ngOnInit() {
    this.storage_get("completed");
    this.storage_get("currentTask");
    this.storage_get("remainingSeconds");
    this.start();
  }

  storage_set(key: string): void {
    const storageKey = "focus." + key;
    localStorage.setItem(storageKey, JSON.stringify(this[key]));
  }

  storage_get(key: string): void {
    const storageKey = "focus." + key;
    const value = localStorage.getItem(storageKey);
    if (value !== null) {
      this[key] = JSON.parse(value);
    }
  }

  storage_del(key: string): void {
    const storageKey = "focus." + key;
    localStorage.removeItem(storageKey);
  }
}
