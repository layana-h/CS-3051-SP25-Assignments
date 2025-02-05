const correctCode = [7, 7, 7, 7];
let enteredCode = [];

function addToCode(num) {
    enteredCode.push(num);
    
    for (let i = 0; i < enteredCode.length; i++) {
        if (enteredCode[i] !== correctCode[i]) {
            enteredCode = [];
            return;
        }    
    }
    
    if (enteredCode.length === correctCode.length) {
        unlockDoor();
    }
}

function unlockDoor() {
    let doorElement = document.querySelector("#door");
    doorElement.classList.add("unlocked");
    

    setTimeout(() => {
        doorElement.classList.remove("unlocked");
        enteredCode = [];
    },  2000);
}    
