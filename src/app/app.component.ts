import { Component, OnInit } from '@angular/core';

import { store } from './constants/globalStore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  collapsed: boolean = true;

  async ngOnInit(): Promise<void> {
    await store.createDB();
  }

  toggleNavbar() {
    this.collapsed = !this.collapsed;
  }
}
