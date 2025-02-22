// src/app/board-detail/board-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../service/board.service';

@Component({
  selector: 'app-board-detail',
  template: `
    <h2>Board #{{ boardId }}</h2>

    <div>
      <h3>Create Task</h3>
      <input [(ngModel)]="newTaskTitle" placeholder="Task Title" />
      <input [(ngModel)]="newTaskDesc" placeholder="Task Description" />
      <button (click)="createTask()">Add Task</button>
    </div>
    <hr />

    <div *ngFor="let task of tasks">
      <p>
        <strong>{{ task.title }}</strong> ({{ task.status }}) 
        <br />
        {{ task.description }}
        <br />
        <button (click)="deleteTask(task.id)">Delete</button>
      </p>
    </div>
  `
})
export class BoardDetailComponent implements OnInit {
  boardId!: number;
  tasks: any[] = [];
  newTaskTitle: string = '';
  newTaskDesc: string = '';

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService
  ) {}

  ngOnInit(): void {
    this.boardId = Number(this.route.snapshot.paramMap.get('boardId'));
    this.loadTasks();
  }

  loadTasks() {
    this.boardService.getTasks(this.boardId).subscribe(data => {
      this.tasks = data;
    });
  }

  createTask() {
    if (!this.newTaskTitle) return;
    this.boardService.createTask(this.boardId, this.newTaskTitle, this.newTaskDesc)
      .subscribe(newTask => {
        this.tasks.push(newTask);
        this.newTaskTitle = '';
        this.newTaskDesc = '';
      });
  }

  deleteTask(taskId: number) {
    this.boardService.deleteTask(taskId).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
    });
  }
}
