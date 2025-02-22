import { Component, OnInit } from '@angular/core';
import { BoardService } from '../service/board.service';

@Component({
  selector: 'app-board-list',
  templateUrl: './board-liast.component.html'
})
export class BoardListComponent implements OnInit {
  boards: any[] = [];
  newBoardName: string = '';

  // สำหรับแก้ไข board
  editingBoardId: number | null = null;
  editBoardName: string = '';

  constructor(private boardService: BoardService) {}

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards() {
    this.boardService.getBoards().subscribe(data => {
      this.boards = data;
    });
  }

  createBoard() {
    if (!this.newBoardName) return;
    this.boardService.createBoard(this.newBoardName).subscribe(newBoard => {
      this.boards.push(newBoard);
      this.newBoardName = '';
    });
  }

  deleteBoard(boardId: number) {
    this.boardService.deleteBoard(boardId).subscribe(() => {
      this.boards = this.boards.filter(b => b.id !== boardId);
    });
  }

  // เริ่มแก้ไข Board
  startEditBoard(board: any) {
    this.editingBoardId = board.id;
    this.editBoardName = board.name;
  }

  // ยกเลิกการแก้ไข
  cancelEditBoard() {
    this.editingBoardId = null;
    this.editBoardName = '';
  }

  // บันทึกการแก้ไข Board
  saveEditBoard(boardId: number) {
    if (!this.editBoardName) return;
    this.boardService.updateBoard(boardId, this.editBoardName)
      .subscribe(updatedBoard => {
        // อัปเดตข้อมูลใน Array
        const index = this.boards.findIndex(b => b.id === boardId);
        if (index !== -1) {
          this.boards[index] = updatedBoard;
        }
        // รีเซ็ตโหมดแก้ไข
        this.editingBoardId = null;
        this.editBoardName = '';
      });
  }
}
