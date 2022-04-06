# Task description  
Создать смарт-контаркт, который будет принимать комментарии;    
  
## Prerequisites  
### yarn
```bash
npm install --global yarn
```
## To run  
```bash
cd Research/receiveComments
yarn
```
  
[Comment.ts](\Comment.ts) содержит пример передачи данных как для первого так и для второго контракта.  
Для запуска [Comment.ts](\Comment.ts) прописать в командной страке:  
```bash
npx ts-node Comment.ts
```
При желании можно параметры вызова контракта - аргументы при вызове `contract.methods.default()`.   
  
### Пример 1
[Smart_contract1.pascaligo](\Smart_contract1.pascaligo) - пример смарт-контракта  
При просмотре транзакции, аргументы отображаются, как 6 переменных типа строка.  
  
Чтобы задеблоить смарт контракт:  
1. надо перейти по адресу https://ide.ligolang.org  
2. Вставить код смарт-контракта и выбрать Deploy  
3. В Storage написать пустую строку  
4. И нажать Run  
  
### Пример 2
[Smart_contract2.pascaligo](\Smart_cotract2.pascaligo) - пример смарт-контракта  
При просмотре транзакции, аргументы метода отображаются с именами.  
  
### Полезные ссылки  
- Реализация опциональных переменных в PascaLigo:
https://ligolang.org/docs/language-basics/unit-option-pattern-matching#optional-values
  
  
информация о том, как сохранять и взаимодействовать(удалять, добовлять) с большим количеством данных в ligo [тут](https://ligolang.org/docs/language-basics/maps-records)  
информация о списках, словарях и sets [тут](https://ligolang.org/docs/language-basics/sets-lists-tuples)  




