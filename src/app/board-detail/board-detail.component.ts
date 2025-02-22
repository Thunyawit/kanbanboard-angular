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

  // ฟอร์มสร้าง Task ใหม่
  newTaskTitle: string = '';
  newTaskDesc: string = '';

  // สำหรับแก้ไข Task
  editingTaskId: number | null = null;  // เก็บ id ของ Task ที่กำลังแก้
  editTitle: string = '';
  editDesc: string = '';
  editStatus: string = 'todo'; // ถ้าต้องการแก้ status ด้วย

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
    this.boardService.createTask(this.boardId, this.newTaskTitle, this.newTaskDesc, 'todo')
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

  // ----------- ฟังก์ชันสำหรับ Edit Task -----------

  // เริ่มแก้ไข Task
  startEdit(task: any) {
    this.editingTaskId = task.id;
    this.editTitle = task.title;
    this.editDesc = task.description;
    this.editStatus = task.status; // ถ้าต้องการแก้ status ด้วย
  }

  // ยกเลิกการแก้ไข
  cancelEdit() {
    this.editingTaskId = null;
    this.editTitle = '';
    this.editDesc = '';
    this.editStatus = 'todo';
  }
  // แก้ไขstatuss
setStatusTodo(task: any) {
  this.boardService.updateTask(task.id, task.title, task.description, 'done')
    .subscribe(updatedTask => {
      const index = this.tasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        this.tasks[index] = updatedTask;  // อัปเดตใน array
      }
    });
}


  // บันทึกการแก้ไข Task
  saveEdit(taskId: number) {
    // เรียก service อัปเดต Task ในฐานข้อมูล
    this.boardService.updateTask(taskId, this.editTitle, this.editDesc, this.editStatus)
      .subscribe(updatedTask => {
        // อัปเดตข้อมูลใน tasks array
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        // รีเซ็ตโหมดแก้ไข
        this.editingTaskId = null;
        this.editTitle = '';
        this.editDesc = '';
        this.editStatus = 'todo';
      });
  }
}
