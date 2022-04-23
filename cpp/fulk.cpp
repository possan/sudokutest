/*
 * Copyright 2011 The Emscripten Authors.  All rights reserved.
 * Emscripten is available under two separate licenses, the MIT license and the
 * University of Illinois/NCSA Open Source License.  Both these licenses can be
 * found in the LICENSE file.
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

extern "C" int main();
extern "C" void createboard(uint32_t size, uint32_t groupsize, uint32_t *cells);
extern "C" void createmultipleboards(uint32_t times, uint32_t size,
                                     uint32_t groupsize);

typedef struct {
  uint32_t fullsize;
  uint32_t groupsize;
  uint32_t *cells;
} Board;

Board *createBoard(uint32_t size, uint32_t groupsize, uint32_t *cells) {
  auto board = (Board *)malloc(sizeof(Board));
  board->fullsize = size;
  board->groupsize = groupsize;
  board->cells = cells;
  return board;
}

int rand2(uint32_t *pointer) {
    pointer[0] ++;
    return pointer[1 + (pointer[0] & 511)];
}

void fillDefaultBoard(Board *target, uint32_t *numbers, uint32_t *randomnumbers) {
  for (uint32_t k = 0; k < target->fullsize; k++) {
    numbers[k] = k+1;
  }

  for (uint32_t k = 0; k < target->fullsize; k++) {
    uint32_t a = rand2(randomnumbers) % target->fullsize;
    uint32_t b = rand2(randomnumbers) % target->fullsize;
    uint32_t t = numbers[a];
    numbers[a] = numbers[b];
    numbers[b] = t;
  }

  uint32_t o = 0;
  uint32_t nbase = rand2(randomnumbers) % target->fullsize;
  for (uint32_t r = 0; r < target->fullsize; r++) {
    uint32_t n = r * target->groupsize;
    n += r / target->groupsize;
    n += nbase;
    for (uint32_t c = 0; c < target->fullsize; c++) {
      n %= target->fullsize;
      target->cells[o] = numbers[n];
      n++;
      o++;
    }
  }
}

void __inline _swapColumns(Board *target, uint32_t col1, uint32_t col2) {
  // console.log('swap column group', col1, col2)
  uint32_t o1 = col1;
  uint32_t o2 = col2;
  for (uint32_t i = 0; i < target->fullsize; i++) {
    uint32_t t = target->cells[o1];
    target->cells[o1] = target->cells[o2];
    target->cells[o2] = t;
    o1 += target->fullsize;
    o2 += target->fullsize;
  }
}

void __inline _swapRows(Board *target, uint32_t row1, uint32_t row2) {
  // console.log('swap row group', row1, row2)
  uint32_t o1 = row1 * target->fullsize;
  uint32_t o2 = row2 * target->fullsize;
  for (uint32_t i = 0; i < target->fullsize; i++) {
    uint32_t t = target->cells[o1];
    target->cells[o1] = target->cells[o2];
    target->cells[o2] = t;
    o1 += 1;
    o2 += 1;
  }
}

// typedef void(ShuffleFunction)(Board *board, uint32_t a, uint32_t b);

void __inline shuffleRandomGroups_Columns(Board *target, uint32_t fixed, uint32_t *randomnumbers) {
  // shuffle whole row groups
  uint32_t rg1 = rand2(randomnumbers) % target->groupsize;
  uint32_t rg2 = rand2(randomnumbers) % target->groupsize;
  if (rg1 != rg2) {
    uint32_t o1 = rg1 * target->groupsize;
    uint32_t o2 = rg2 * target->groupsize;
    for (uint32_t o = 0; o < target->groupsize; o++) {
      _swapColumns(target, o1, o2);
      o1++;
      o2++;
    }
  }
}

void __inline shuffleRandomGroups_Rows(Board *target, uint32_t fixed, uint32_t *randomnumbers) {
  // shuffle whole row groups
  uint32_t rg1 = rand2(randomnumbers) % target->groupsize;
  uint32_t rg2 = rand2(randomnumbers) % target->groupsize;
  if (rg1 != rg2) {
    uint32_t o1 = rg1 * target->groupsize;
    uint32_t o2 = rg2 * target->groupsize;
    for (uint32_t o = 0; o < target->groupsize; o++) {
      _swapRows(target, o1, o2);
      o1++;
      o2++;
    }
  }
}

void __inline shuffleRandomInternal_Columns(Board *target, uint32_t fixed, uint32_t *randomnumbers) {
  // shuffle whole row groups
  uint32_t rg1 = rand2(randomnumbers) % target->groupsize;
  uint32_t rg2 = rand2(randomnumbers) % target->groupsize;
  if (rg1 != rg2) {
    uint32_t o1 = rg1 * target->groupsize;
    uint32_t o2 = rg2 * target->groupsize;
    for (uint32_t o = 0; o < target->groupsize; o++) {
      _swapColumns(target, o1, o2);
      o1++;
      o2++;
    }
  }
}

void __inline shuffleRandomInternal_Rows(Board *target, uint32_t fixed, uint32_t *randomnumbers) {
  // shuffle whole row groups
  uint32_t rg1 = rand2(randomnumbers) % target->groupsize;
  uint32_t rg2 = rand2(randomnumbers) % target->groupsize;
  if (rg1 != rg2) {
    uint32_t o1 = rg1 * target->groupsize;
    uint32_t o2 = rg2 * target->groupsize;
    for (uint32_t o = 0; o < target->groupsize; o++) {
      _swapRows(target, o1, o2);
      o1++;
      o2++;
    }
  }
}

void shuffleBoard(Board *target, uint32_t *randomnumbers) {
  uint32_t shuffles = target->fullsize * 4;
  while (shuffles-- > 0) {
    uint32_t wat = rand2(randomnumbers) % 4;
    switch (wat) {
    case 0:
      shuffleRandomGroups_Columns(target, 0, randomnumbers);
      break;
    case 1:
      shuffleRandomGroups_Rows(target, 0, randomnumbers);
      break;
    case 2:
      shuffleRandomInternal_Columns(target, 0, randomnumbers);
      break;
    case 3:
      shuffleRandomInternal_Rows(target, 0, randomnumbers);
      break;
    }
  }
}

void createboard(uint32_t size, uint32_t groupsize, uint32_t *cells) {
  srand((long)time(NULL));
  uint32_t *numbers = (uint32_t *)malloc(sizeof(uint32_t) * size);
  uint32_t *randomnumbers = (uint32_t *)malloc(sizeof(uint32_t) * 600);
  for(uint32_t k=0; k<600; k++) {
      randomnumbers[k] = rand();
  }
  Board *board = createBoard(size, groupsize, cells);
  fillDefaultBoard(board, numbers, randomnumbers);
  shuffleBoard(board, randomnumbers);
  delete (board);
  delete randomnumbers;
  delete (numbers);
}

void createmultipleboards(uint32_t times, uint32_t size, uint32_t groupsize) {
  srand((long)time(NULL));
  uint32_t *numbers = (uint32_t *)malloc(sizeof(uint32_t) * size);
  uint32_t *randomnumbers = (uint32_t *)malloc(sizeof(uint32_t) * 600);
  for(uint32_t k=0; k<600; k++) {
      randomnumbers[k] = rand();
  }
  uint32_t *cells = (uint32_t *)malloc(sizeof(uint32_t) * size * size);
  Board *board = createBoard(size, groupsize, cells);
  fillDefaultBoard(board, numbers, randomnumbers);
  for (uint32_t k = 0; k < times; k++) {
    shuffleBoard(board, randomnumbers);
  }
  delete (board);
  delete cells;
  delete randomnumbers;
  delete numbers;
}

int main() {
  printf("hello, world!\n");
  return 0;
}
