/**
 * 创建并编译一个着色器
 *
 * @param {!WebGLRenderingContext} gl WebGL上下文。
 * @param {string} shaderSource GLSL 格式的着色器代码
 * @param {number} shaderType 着色器类型, VERTEX_SHADER 或
 *     FRAGMENT_SHADER。
 * @return {!WebGLShader} 着色器。
 */
function compileShader(gl, shaderSource, shaderType) {
    // 创建着色器程序
    let shader = gl.createShader(shaderType)

    // 设置着色器的源码
    gl.shaderSource(shader, shaderSource)

    // 编译着色器
    gl.compileShader(shader)

    // 检测编译是否成功
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)

    if(!success){
         // 编译过程出错，获取错误信息。
        throw "could not compile shader:" + gl.getShaderInfoLog(shader) 
    }

    return shader
}

/**
 * 从 2 个着色器中创建一个程序
 *
 * @param {!WebGLRenderingContext) gl WebGL上下文。
 * @param {!WebGLShader} vertexShader 一个顶点着色器。
 * @param {!WebGLShader} fragmentShader 一个片断着色器。
 * @return {!WebGLProgram} 程序
 */
function createProgram(gl, vertexShader, fragmentShader) {
    // 创建一个程序
    let program = gl.createProgram()

     // 附上着色器
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    // 链接到程序
    gl.linkProgram(program)

    // 检查链接是否成功
    let success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if(!success){
         // 链接过程出现问题
        throw ("program failed to link:" + gl.getProgramIngoLog(program))
    }

    return program
}

/**
 * 用 script 标签的内容创建着色器
 *
 * @param {!WebGLRenderingContext} gl WebGL上下文。
 * @param {string} scriptId script标签的id。
 * @param {string} opt_shaderType. 要创建的着色器类型。
 *     如果没有定义，就使用script标签的type属性。
 *     
 * @return {!WebGLShader} 着色器。
 */
function createShaderFromScript(gl, scriptId, opt_shaderType){
    // 通过id找到script标签
    let shaderScript = document.getElementById(scriptId)
    if(!scriptId){
        throw('*** Error: unknown script element' + scriptId)
    }

    // 提取标签内容
    let shdaerSource = shaderScript.text

     // 如果没有传着色器类型，就使用标签的 ‘type’ 属性
     if(!opt_shaderType) {
         if(shaderScript.type === 'x-shader/x-vertex'){
            opt_shaderType = gl.VERTEX_SHADER
         } else if(shaderScript.type === 'x-shader/x-fragment'){
            opt_shaderType = gl.FRAGMENT_SHADER
         } else if(!opt_shaderType){
             throw('*** Error: shader type not set')
         }
     }

     return compileShader(gl, shaderSource, opt_shaderType)
}

/**
 * 通过两个 script 标签创建程序。
 *
 * @param {!WebGLRenderingContext} gl WebGL上下文。
 * @param {string} vertexShaderId 顶点着色器的标签id。
 * @param {string} fragmentShaderId 片断着色器的标签id。
 * @return {!WebGLProgram} 程序。
 */
function createProgramFromScripts(
    gl, vertexShaderId, fragmentShaderId) {
        let vertexShader = createShaderFromScript(gl, vertexShaderId, gl.VERTEX_SHADER)
        let fragmentShader = createShaderFromScript(gl, fragmentShaderId, gl.FRAGMENT_SHADER)
        return createProgram(gl, vertexShader, fragmentShader)
    }
