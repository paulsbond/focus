import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  completedSessions = [];
  currentTask = "";
  running = false;
  remainingSeconds = 1500;

  start() {
    if (this.currentTask === "") return;
    console.log(this.currentTask);
    this.running = true;
    const interval = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds === 0) {
        clearInterval(interval);
        this.completedSessions.push({
          task: this.currentTask,
          endTime: Date.now()
        });
        this.running = false;
        this.remainingSeconds = 1500;
        this.currentTask = "";
      }
    }, 1000);
  }
}
