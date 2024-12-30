class Rotater {
    #div;
    #frames;
    #currentFrame = 0;
    #x;
    #isRotation = false;
    #observer;

    constructor(id) {
        this.#div = document.getElementById(id);
        this.#frames = this.#div.getElementsByTagName('img');

        this.#PreloadImagesAsync()
            .then(() => {
                const options = {
                    root: null,
                    rootMargin: "0px",
                    threshold: 0.8,
                };
                this.#observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && entries[0].target === this.#div) {
                        this.#observer?.unobserve(this.#div);
                        this.RunInitialRotation();
                    }}, options);
                this.#observer.observe(this.#div);
        
                // Attach events
                this.#div.addEventListener('pointerdown', (e) => this.BeginRotation(e), true);
                this.#div.addEventListener('pointermove', (e) => this.Rotate(e), true);
                this.#div.addEventListener('pointerup', (e) => this.EndRotation(e), true);
                })
            .catch(() => this.#div.innerText = "At least one image failed to load");        
    }

    #PreloadImagesAsync() {
        const LoadImage = (img) => {
            return new Promise((resolve, reject) => {
                var newImage = new Image();
                newImage.onload = function() {
                    resolve(newImage);
                };
                newImage.onerror = newImage.onabort = () => {
                    reject(newImage);
                };

                // Set up the new image
                newImage.src = img.src;
                Rotater.Hide(newImage);
                // Insert new image and remove old
                img.parentNode.insertBefore(newImage, img);
                img.parentNode.removeChild(img);
            });
        }

        var promises = [];
        for (var i = 1; i < this.#frames.length; i++) {
            promises.push(LoadImage(this.#frames[i]));
        }
        return Promise.all(promises);
    }

    RunInitialRotation() {
        this.#isRotation = true;
        const milliseconds = 15;
        let count = 0;
        let timerId;
        const ShowPrevImage = () => {
            count++;
            if (count > this.#frames.length) {
                clearInterval(timerId);
                this.#isRotation = false;   
            } else {
                this.#ShowPrev();
            }
        }

        timerId = setInterval(() => ShowPrevImage(), milliseconds);
    }

    BeginRotation(e) {
        if (this.#isRotation) {
            return;
        }

        e.preventDefault();
        this.#div.setPointerCapture(e.pointerId);
        this.#x = e.x;
        this.#isRotation = true;
    }

    Rotate(e) {
        e.preventDefault();
        if (!this.#isRotation) {
            return;
        }

        const x = e.x;
        if (x > this.#x) {
            this.#ShowPrev();
            this.#x = x;
        } else if (x < this.#x) {
            this.#ShowNext();
            this.#x = x;
        }
    }

    EndRotation(e) {
        this.#isRotation = false;
        this.#div.releasePointerCapture(e.pointerId);
    }

    #ShowPrev() {
        const oldIndex = this.#currentFrame;
        this.#currentFrame--;
        if (this.#currentFrame < 0) {
            this.#currentFrame = this.#frames.length - 1;
        }

        Rotater.Show(this.#frames[this.#currentFrame]);
        Rotater.Hide(this.#frames[oldIndex]);
    }

    #ShowNext() {
        const oldIndex = this.#currentFrame;
        this.#currentFrame++;
        if (this.#currentFrame >= this.#frames.length) {
            this.#currentFrame = 0;
        }

        Rotater.Show(this.#frames[this.#currentFrame]);
        Rotater.Hide(this.#frames[oldIndex]);
    }

    static Show(element) {
        element.style.display = '';
    }

    static Hide(element) {
        element.style.display = 'none';
    }
}