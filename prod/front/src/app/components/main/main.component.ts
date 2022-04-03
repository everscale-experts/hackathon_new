import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

const EverTokenList = ['SOON', 'BRIDGE'];
import TezosTokenList from '../../../assets/tezosTokenList.json';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
