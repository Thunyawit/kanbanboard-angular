import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../service/board.service';

@Component({
  selector: 'app-board-detail',
  templateUrl: './board-detail.component.html'
})
export class BoardDetailComponent implements OnInit {
  boardId!: number;
  tasks: any[] = [];
  
  newTaskTitle: string = '';
  newTaskDesc: string = '';
  newTaskTags: string = '';

  // สำหรับ Edit Task
  editingTaskId: number | null = null;
  editTitle: string = '';
  editDesc: string = '';
  editStatus: string = 'todo';
  editTags: string = '';

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
    this.boardService.createTask(this.boardId, this.newTaskTitle, this.newTaskDesc, 'todo', this.newTaskTags)
      .subscribe(newTask => {
        this.tasks.push(newTask);
        this.newTaskTitle = '';
        this.newTaskDesc = '';
        this.newTaskTags = '';
        this.loadTasks();
      });
  }

  deleteTask(taskId: number) {
    this.boardService.deleteTask(taskId).subscribe(() => {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.loadTasks();
    });
  }

  startEdit(task: any) {
    this.editingTaskId = task.id;
    this.editTitle = task.title;
    this.editDesc = task.description;
    this.editStatus = task.status;
    this.editTags = task.tags;
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editTitle = '';
    this.editDesc = '';
    this.editStatus = 'todo';
    this.editTags = '';
  }

  saveEdit(taskId: number) {
    this.boardService.updateTask(taskId, this.editTitle, this.editDesc, this.editStatus, this.editTags)
      .subscribe(updatedTask => {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.editingTaskId = null;
        this.editTitle = '';
        this.editDesc = '';
        this.editStatus = 'todo';
        this.editTags = '';
        this.loadTasks();
      });
  }

  setStatusDone(task: any) {
    // เปลี่ยนสถานะเป็น 'done' แต่คง title, description และ tags เดิมไว้
    this.boardService.updateTask(task.id, task.title, task.description, 'done', task.tags)
      .subscribe(updatedTask => {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
      });
  }
}
