cmake_minimum_required(VERSION 3.5)
project(whoosh C)

add_executable(whoosh
   main.c)

wut_create_rpx(whoosh)

install(FILES "${CMAKE_CURRENT_BINARY_DIR}/whoosh.rpx"
        DESTINATION "${CMAKE_INSTALL_PREFIX}")