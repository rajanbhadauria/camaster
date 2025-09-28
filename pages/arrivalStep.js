class ArrivalStep {
    constructor(page) {
        this.page = page;
        this.arrivalTitle = page.locator('.arrival__title');
        this.arrivalBy = page.locator('#arrival-arrivalBy');

    }
}
export { ArrivalStep };