import { Component, OnInit } from '@angular/core';
import { BoardService } from '../service/board.service';

@Component({
  selector: 'app-board-list',
  templateUrl: './board-liast.component.html'
})
export class BoardListComponent implements OnInit {
  boards: any[] = [];
  newBoardName: string = '';

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
}
