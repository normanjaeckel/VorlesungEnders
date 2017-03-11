CustomModuleNotFoundError = function () {
    this.code = 'MODULE_NOT_FOUND';
}
CustomModuleNotFoundError.prototype = new Error()

throw new CustomModuleNotFoundError();
