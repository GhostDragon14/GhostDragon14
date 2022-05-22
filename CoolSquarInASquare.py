# HomeWork1.py

import turtle

colors = ["white","grey","orange","green","blue","red"]

t = turtle.Pen()
turtle.bgcolor('black')
t.speed(0)
for x in range(600):
    t.pencolor(colors[1])
    t.forward(x)
    t.width(4)
    t.left(90)
t.home()
for x in range(500):
    t.pencolor(colors[2])
    t.forward(x)
    t.width(4)
    t.left(90)
t.home()
for x in range(400):
    t.pencolor(colors[3])
    t.forward(x)
    t.width(4)
    t.left(90)
t.home()
for x in range(300):
    t.pencolor(colors[4])
    t.forward(x)
    t.width(4)
    t.left(90)
t.home()
for x in range(200):
    t.pencolor(colors[5])
    t.forward(x)
    t.width(4)
    t.left(90)
t.home()
for x in range(100):
    t.pencolor(colors[0])
    t.forward(x)
    t.width(4)
    t.left(90)
