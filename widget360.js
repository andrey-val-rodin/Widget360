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

        const options = {
            root: null,
            rootMargin: "0px",
            threshold: 0.8,
        };
        this.#observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && entries[0].target === this.#div) {
                this.RunInitialRotation();
            }}, options);
        this.#observer.observe(this.#div);

        // Hide all
        [].forEach.call(this.#frames, element => { Rotater.Hide(element); });

        // Show first
        Rotater.Show(this.#frames[0]);

        // Attach events
        const that = this;
        this.#div.addEventListener('pointerdown', (e) => that.BeginRotation(e), true);
        this.#div.addEventListener('pointermove', (e) => that.Rotate(e), true);
        this.#div.addEventListener('pointerup', (e) => that.EndRotation(e), true);
    }

    RunInitialRotation() {
        this.#isRotation = true;
        const milliseconds = 15;
        let timerId = setInterval(() => this.#ShowPrev(), milliseconds);
        setTimeout(() => {
            clearInterval(timerId);
            this.#isRotation = false;
        }, milliseconds * this.#frames.length);
        this.#observer?.unobserve(this.#div);
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
