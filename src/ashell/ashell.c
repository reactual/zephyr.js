// Copyright (c) 2017-2018, Intel Corporation.

/**
 * @file
 * @brief Ashell main.
 */

#include "ashell.h"

void zjs_ashell_init()
{
#ifdef ASHELL_UART
    extern void uart_init();
    uart_init();
#else
    extern void ide_init();
    ide_init();
#endif  // ASHELL_UART
}

void zjs_ashell_process()
{
#ifdef ASHELL_UART
    extern void uart_process();
    uart_process();
#else
    extern void ide_process();
    ide_process();
#endif  // ASHELL_UART
}
