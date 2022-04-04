import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import {FormControl, Validators} from '@angular/forms';

import EverTokenList from '../../../assets/EverTokenList.json';
import TezosTokenList from '../../../assets/TezosTokenList.json';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  amountControl = new FormControl('', [
    Validators.pattern('\d+'),
    Validators.min(1),
    Validators.max(9999),
  ]);

  srcChain = 'Everscale';
  dstChain = 'Tezos';
  srcCoin = 'EVER';
  dstCoin = 'TXZ';
  srcTokenList = EverTokenList.map(el => el.name);
  dstTokenList = TezosTokenList.map(el => el.name);
  srcTokenChosen = 'EVER';
  dstTokenChosen = 'wEVER';
  srcAmount = '0';
  dstAmount = '0';

  constructor() { }

  ngOnInit(): void {
  }

  onClick(type: string, e: any): void {
    console.log(type, ':', e);
  }

  onChainValueChange(isSrcChainTezos: boolean) {
    if (isSrcChainTezos) {
      this.srcChain = 'Tezos';
      this.dstChain = 'Everscale'
      // change token list
      this.srcCoin = 'TXZ';
      this.dstCoin = 'EVER';
      this.srcTokenList = TezosTokenList.map(el => el.name);
      this.dstTokenList = EverTokenList.map(el => el.name);
      this.srcTokenChosen = 'TXZ';
      this.dstTokenChosen = 'wTXZ';
    } else {
      this.srcChain = 'Everscale';
      this.dstChain = 'Tezos';
      // change token list
      this.srcCoin = 'EVER';
      this.dstCoin = 'TXZ';
      this.srcTokenList = EverTokenList.map(el => el.name);
      this.dstTokenList = TezosTokenList.map(el => el.name);
      this.srcTokenChosen = 'EVER';
      this.dstTokenChosen = 'wEVER';
    }
  }

  onSelectionChange(event: MatSelectChange) {
    console.log('onSelectionChange, newValue = ', event.value, event.source);
  }

  onSrcTokenChange(newTokenValue: string) {
    if( newTokenValue === this.srcTokenList[0]) {
      this.dstTokenChosen = this.dstCoin;
    } else {
      this.dstTokenChosen = this.dstTokenList[0];
    }
  }

  onDstTokenChange(newTokenValue: string) {
    if( newTokenValue === this.dstTokenList[0]) {
      this.srcTokenChosen = this.srcCoin;
    } else {
      this.srcTokenChosen = this.srcTokenList[0];
    }
  }

  // TODO: calculate on every keypress
  calculateAmount(isSrcChanged: boolean, newValue: string) {
    if(isSrcChanged) {
      this.dstAmount = (Number.parseFloat(newValue) * 0.99).toFixed(8)
        .replace(/(\.\d*)0+/, '$1');  // FIXME: remove ending 0s
    } else {
      this.srcAmount = (Number.parseFloat(newValue) / 0.99).toFixed(8)
        .replace(/\.0+$/, '');
    }
  }

  consoleLog(event: any) {
    console.log(event);
  }

}
