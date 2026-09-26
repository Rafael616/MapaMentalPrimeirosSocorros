const allButtons = document.querySelector('.all-buttons');
const mapButton = document.querySelector('.map-button');
const buttons = document.querySelectorAll('.all-click');
const map = document.querySelector('.map');
const lines = document.querySelector('.lines');
const boxes = document.querySelectorAll('.content-box');

let move = false;
let atualButton;
let offsetX;
let offsetY;
let linesArray = [];
let boxLinesArray = [];
let moveBox = false;
let currentBox;
let boxOffsetX;
let boxOffsetY;
let mapTimeout;
let lastTap = 0;
let touchStartX = 0;
let touchStartY = 0;

function createLine() {

    lines.innerHTML = '';

    linesArray = [];

    buttons.forEach(function (button) {

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

        const mapButtonRect = mapButton.getBoundingClientRect();

        const buttonRect = button.getBoundingClientRect();

        const mapRect = map.getBoundingClientRect();

        const mapCenterX = mapButtonRect.left - mapRect.left + mapButtonRect.width / 2;

        const mapCenterY = mapButtonRect.top - mapRect.top + mapButtonRect.height / 2;

        const buttonCenterX = buttonRect.left - mapRect.left + buttonRect.width / 2;

        const buttonCenterY = buttonRect.top - mapRect.top + buttonRect.height / 2;

        const middleX = (mapCenterX + buttonCenterX) / 2;

        const middleY = (mapCenterY + buttonCenterY) / 2;

        const curveAmount = 70;

        const curve = `
            M ${mapCenterX} ${mapCenterY}

            C ${middleX - curveAmount} ${mapCenterY},
              ${middleX + curveAmount} ${middleY},
              ${middleX} ${middleY}

            C ${middleX - curveAmount} ${middleY},
              ${middleX + curveAmount} ${buttonCenterY},
              ${buttonCenterX} ${buttonCenterY}
        `;

        const buttonColor = getComputedStyle(button).backgroundColor;

        line.setAttribute('d', curve);

        line.setAttribute('stroke', buttonColor);

        line.setAttribute('stroke-width', '2');

        line.setAttribute('fill', 'none');

        const lineLength = line.getTotalLength();

        line.style.strokeDasharray = lineLength;

        line.style.strokeDashoffset = lineLength;

        lines.appendChild(line);

        linesArray.push(line);

    });

}

function createBoxLine(box, index) {

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    line.classList.add('box-line');

    const button = buttons[index];

    const buttonRect = button.getBoundingClientRect();

    const boxRect = box.getBoundingClientRect();

    const mapRect = map.getBoundingClientRect();

    const buttonX = buttonRect.left - mapRect.left + buttonRect.width / 2;

    const buttonY = buttonRect.top - mapRect.top + buttonRect.height / 2;

    const boxX = boxRect.left - mapRect.left;

    const boxY = boxRect.top - mapRect.top + boxRect.height / 2;

    const middleX = (buttonX + boxX) / 2;

    const middleY = (buttonY + boxY) / 2;

    const curveAmount = 70;

    const curve = `
        M ${buttonX} ${buttonY}

        C ${middleX - curveAmount} ${buttonY},
          ${middleX + curveAmount} ${middleY},
          ${middleX} ${middleY}

        C ${middleX - curveAmount} ${middleY},
          ${middleX + curveAmount} ${boxY},
          ${boxX} ${boxY}
    `;

    const buttonColor = getComputedStyle(button).backgroundColor;

    line.setAttribute('d', curve);

    line.setAttribute('stroke', buttonColor);

    line.setAttribute('stroke-width', '2');

    line.setAttribute('fill', 'none');

    const lineLength = line.getTotalLength();

    line.style.strokeDasharray = lineLength;

    line.style.strokeDashoffset = lineLength;

    lines.appendChild(line);

    boxLinesArray[index] = line;

    setTimeout(function () {

        line.style.transition = 'stroke-dashoffset 0.5s ease';

        line.style.strokeDashoffset = '0';

    }, 10);

}

mapButton.addEventListener('click', function () {

    clearTimeout(mapTimeout);

    allButtons.classList.toggle('open');

    map.classList.toggle('open');

    if (allButtons.classList.contains('open')) {

        lines.style.display = 'block';

        createLine();

        mapTimeout = setTimeout(function () {

            lines.querySelectorAll('path').forEach(function (line) {

                line.style.transition = 'stroke-dashoffset 0.8s ease';

                line.style.strokeDashoffset = '0';

            });

        }, 100);

    } else {

        lines.querySelectorAll('path').forEach(function (line) {

            line.style.transition = 'stroke-dashoffset 0.5s ease';

            line.style.strokeDashoffset = line.getTotalLength();

        });

        boxes.forEach(function (box) {

            box.style.display = 'none';

        });

        boxLinesArray = [];

        mapTimeout = setTimeout(function () {

            lines.style.display = 'none';

        }, 500);

    }

});

buttons.forEach(function (button) {
    button.addEventListener('pointerdown', function (event) {

        event.preventDefault();

        move = true;
        atualButton = button;
        const buttonRect = button.getBoundingClientRect();

        offsetX = event.clientX - buttonRect.left;
        offsetY = event.clientY - buttonRect.top;
    });
});

buttons.forEach(function (button) {

    button.addEventListener('touchstart', function (event) {

        const touch = event.touches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

    });

    button.addEventListener('touchend', function (event) {

        const touch = event.changedTouches[0];

        const distanceX = Math.abs(touch.clientX - touchStartX);
        const distanceY = Math.abs(touch.clientY - touchStartY);

        // Se o dedo se moveu, foi arraste e não toque
        if (distanceX > 10 || distanceY > 10) {
            lastTap = 0;
            return;
        }

        const currentTime = Date.now();

        if (currentTime - lastTap < 400) {

            button.dispatchEvent(new MouseEvent('dblclick', {
                bubbles: true
            }));

            lastTap = 0;

        } else {

            lastTap = currentTime;

        }

    });

});

buttons.forEach(function (button, index) {

    button.addEventListener('pointerenter', function () {

        const currentLine = linesArray[index];

        if (currentLine) {
            currentLine.setAttribute('stroke-width', '4');
        }

    });

    button.addEventListener('pointerleave', function () {

        const currentLine = linesArray[index];

        if (currentLine) {
            currentLine.setAttribute('stroke-width', '2');
        }

    });

});

document.addEventListener('pointermove', function (event) {

    if (move) {

        const mapRect = map.getBoundingClientRect();

        let newLeft = event.clientX - mapRect.left - offsetX;
        let newTop = event.clientY - mapRect.top - offsetY;

        const buttonRect = atualButton.getBoundingClientRect();

        const maxLeft = mapRect.width - buttonRect.width;
        const maxTop = mapRect.height - buttonRect.height;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        atualButton.style.left = newLeft + 'px';
        atualButton.style.top = newTop + 'px';

        const buttonCenterX = newLeft + buttonRect.width / 2;
        const buttonCenterY = newTop + buttonRect.height / 2;

        const buttonIndex = Array.from(buttons).indexOf(atualButton);

        const currentLine = linesArray[buttonIndex];

        const mapButtonRect = mapButton.getBoundingClientRect();

        const mapCenterX = mapButtonRect.left - mapRect.left + mapButtonRect.width / 2;
        const mapCenterY = mapButtonRect.top - mapRect.top + mapButtonRect.height / 2;

        const middleX = (mapCenterX + buttonCenterX) / 2;
        const middleY = (mapCenterY + buttonCenterY) / 2;

        const curveAmount = 170;

        const curve = `
            M ${mapCenterX} ${mapCenterY}   

            C ${middleX - curveAmount} ${mapCenterY},
              ${middleX + curveAmount} ${middleY},
              ${middleX} ${middleY}

            C ${middleX - curveAmount} ${middleY},
              ${middleX + curveAmount} ${buttonCenterY},
              ${buttonCenterX} ${buttonCenterY}
        `;

        currentLine.style.transition = 'none';

        currentLine.setAttribute('d', curve);

        const lineLength = currentLine.getTotalLength();

        currentLine.style.strokeDasharray = lineLength;
        currentLine.style.strokeDashoffset = 0;

        const boxLine = boxLinesArray[buttonIndex];

        if (boxLine) {

            const box = boxes[buttonIndex];

            const boxRect = box.getBoundingClientRect();

            const buttonRect = atualButton.getBoundingClientRect();

            const buttonX = buttonRect.left - mapRect.left + buttonRect.width / 2;

            const buttonY = buttonRect.top - mapRect.top + buttonRect.height / 2;

            const boxX = boxRect.left - mapRect.left;

            const boxY = boxRect.top - mapRect.top + boxRect.height / 2;

            const boxMiddleX = (buttonX + boxX) / 2;

            const boxMiddleY = (buttonY + boxY) / 2;

            const curveAmount = 170;

            const curve = `
        M ${buttonX} ${buttonY}

        C ${boxMiddleX - curveAmount} ${buttonY},
          ${boxMiddleX + curveAmount} ${boxMiddleY},
          ${boxMiddleX} ${boxMiddleY}

        C ${boxMiddleX - curveAmount} ${boxMiddleY},
          ${boxMiddleX + curveAmount} ${boxY},
          ${boxX} ${boxY}
    `;

            boxLine.setAttribute('d', curve);

            const boxLineLength = boxLine.getTotalLength();

            boxLine.style.strokeDasharray = boxLineLength;
            boxLine.style.strokeDashoffset = 0;

        }
    }

    if (moveBox) {
        const mapRect = map.getBoundingClientRect();

        let newLeft = event.clientX - mapRect.left - boxOffsetX;
        let newTop = event.clientY - mapRect.top - boxOffsetY;

        const boxWidth = currentBox.offsetWidth;
        const boxHeight = currentBox.offsetHeight;

        const maxLeft = mapRect.width - boxWidth;
        const maxTop = mapRect.height - boxHeight;

        newLeft = Math.max(0, Math.min(newLeft, maxLeft));
        newTop = Math.max(0, Math.min(newTop, maxTop));

        currentBox.style.left = newLeft + 'px';
        currentBox.style.top = newTop + 'px';

        const boxIndex = Array.from(boxes).indexOf(currentBox);
        const currentBoxLine = boxLinesArray[boxIndex];

        if (currentBoxLine) {
            const button = buttons[boxIndex];

            const buttonRect = button.getBoundingClientRect();
            const boxRect = currentBox.getBoundingClientRect();

            const buttonX =
                buttonRect.left - mapRect.left + buttonRect.width / 2;

            const buttonY =
                buttonRect.top - mapRect.top + buttonRect.height / 2;

            const boxX = boxRect.left - mapRect.left;

            const boxY =
                boxRect.top - mapRect.top + boxRect.height / 2;

            const boxMiddleX = (buttonX + boxX) / 2;
            const boxMiddleY = (buttonY + boxY) / 2;

            const curveAmount = 70;

            const curve = `
            M ${buttonX} ${buttonY}

            C ${boxMiddleX - curveAmount} ${buttonY},
              ${boxMiddleX + curveAmount} ${boxMiddleY},
              ${boxMiddleX} ${boxMiddleY}

            C ${boxMiddleX - curveAmount} ${boxMiddleY},
              ${boxMiddleX + curveAmount} ${boxY},
              ${boxX} ${boxY}
        `;

            currentBoxLine.setAttribute('d', curve);

            const boxLineLength = currentBoxLine.getTotalLength();

            currentBoxLine.style.strokeDasharray = boxLineLength;
            currentBoxLine.style.strokeDashoffset = 0;
        }
    }
});

document.addEventListener('pointerup', function () {
    move = false;
    moveBox = false;
});

buttons.forEach(function (button, index) {

    button.addEventListener('dblclick', function () {

        const box = document.querySelector('.box' + (index + 1));

        if (box.style.display === 'block') {

            const boxIndex = Array.from(boxes).indexOf(box);

            box.style.opacity = '0';
            box.style.transform = 'scale(0.7)';

            const boxLine = boxLinesArray[boxIndex];

            if (boxLine) {

                boxLine.style.transition = 'stroke-dashoffset 0.4s ease';

                boxLine.style.strokeDashoffset = boxLine.getTotalLength();

            }

            setTimeout(function () {

                box.style.display = 'none';

                if (boxLine) {

                    boxLine.remove();

                    boxLinesArray[boxIndex] = null;

                }

            }, 400);


        } else {

            box.style.display = 'block';

            setTimeout(function () {

                box.style.opacity = '1';
                box.style.transform = 'scale(1)';

            }, 10);

            box.style.backgroundColor = getComputedStyle(button).backgroundColor;

            box.style.color = 'white';

            const buttonRect = button.getBoundingClientRect();

            const mapRect = map.getBoundingClientRect();

            const mapCenterX = mapRect.width / 2;

            const mapCenterY = mapRect.height / 2;

            const buttonCenterX = buttonRect.left - mapRect.left + buttonRect.width / 2;

            const buttonCenterY = buttonRect.top - mapRect.top + buttonRect.height / 2;

            let newLeft;

            let newTop;

            const distanceX = Math.abs(buttonCenterX - mapCenterX);

            const distanceY = Math.abs(buttonCenterY - mapCenterY);

            if (distanceX > distanceY) {

                if (buttonCenterX < mapCenterX) {
                    newLeft = buttonRect.left - mapRect.left - box.offsetWidth - 80;
                } else {
                    newLeft = buttonRect.right - mapRect.left + 80;
                }

                newTop = buttonCenterY - box.offsetHeight / 2;

            } else {

                newLeft = buttonCenterX - box.offsetWidth / 2;

                if (buttonCenterY < mapCenterY) {
                    newTop = buttonRect.top - mapRect.top - box.offsetHeight - 80;
                } else {
                    newTop = buttonRect.bottom - mapRect.top + 80;
                }
            }


            // limita a box ao mapa
            const maxLeft = mapRect.width - box.offsetWidth;
            const maxTop = mapRect.height - box.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));


            box.style.left = newLeft + 'px';
            box.style.top = newTop + 'px';

            createBoxLine(box, index);

        }
    });

});

boxes.forEach(function (box) {

    box.addEventListener('pointerdown', function (event) {

        event.preventDefault();

        moveBox = true;
        currentBox = box;

        const boxRect = box.getBoundingClientRect();

        boxOffsetX = event.clientX - boxRect.left;
        boxOffsetY = event.clientY - boxRect.top;

    });

});