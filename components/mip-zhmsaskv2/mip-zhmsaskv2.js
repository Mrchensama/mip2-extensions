import './index.less';
const { CustomElement } = MIP;
export default class MIPZhmsaskv2 extends MIP.CustomElement {
    constructor(element) {
        super(element);
        this.IsSubmit = false;
        this.show = true;
        this.close = false;
        this.isBlock = false;
        this.hasPic = false;
        this.showToastText = '';
        this.showTime = 2500;
        this.handleShow = this.handleShow.bind(this);
        this.handleHide = this.handleHide.bind(this);
    }
    build() {
        this.render();
        this.addEventAction('show', this.handleShow);
        this.addEventAction('hidden', this.handleHide);
        this.InitPage();
        this.BindQuickBtn();
        this.BindSubmit();
    }

    InitPage() {
        let MaleRadios = document.getElementsByName("Sex-lable");
        MIP.viewer.eventAction.execute('tap', MaleRadios[0]);
    }
    BindQuickBtn() {
        let quickbtns = document.getElementsByClassName("mip-zhmsask")[0].getElementsByClassName("quickquestion");
        for (let i = 0; i < quickbtns.length; i++) {
            this.tap(quickbtns[i], function (e) {
                let question_area = document.getElementsByName("Question")[0];
                let question = question_area.value;
                if (question.indexOf(e.target.innerText) > -1) {
                    question_area.value = question.replace(e.target.innerText, "");
                    quickbtns[i].classList.remove("ct");
                }
                else {
                    question_area.value = question + e.target.innerText;
                    quickbtns[i].classList.add("ct");
                }

            });
        }
    }    
    BindSubmit() {
        var $this = this;
        var e_form = document.getElementsByClassName("mip-zhmsask")[0];
        $this.tap(e_form.getElementsByClassName("mip-zhmsask-submit-btn")[0], function () {
            if (!$this.IsSubmit) {
                $this.IsSubmit = true;
                let data = {};
                data.NickName = document.getElementsByName("NickName")[0].value;
                if (!data.NickName || data.NickName.length <= 0) {
                    $this.Toast("请填写您的姓名");
                    $this.IsSubmit = false;
                    return false;
                }
                data.Sex = $this.GetRadioValue("Sex")
                data.Tel = document.getElementsByName("Tel")[0].value;
                if (!data.Tel || data.Tel.length <= 0) {
                    $this.Toast("请填写您的联系电话");
                    $this.IsSubmit = false;
                    return false;
                }

                data.Question = document.getElementsByName("Question")[0].value;
                data.MerchantId = $this.element.getAttribute("MerchantId");
                data.BrandId = $this.element.getAttribute("BrandId");
                data.CategoryId = $this.element.getAttribute("CategoryId");
                data.SourceUrl = $this.element.getAttribute("Source");
                var a = {
                    method: "POST",
                    body: JSON.stringify(data)
                };
                fetch("https://mip.zhms.cn/brand/addconsultation/", a).then(function (response) {
                    $this.IsSubmit = false;
                    return response.json();
                }).then(function (json) {
                    $this.IsSubmit = false;
                    //handleRes(json) 
                    if (json.state !== 0) $this.Toast(json.msg || "咨询失败，请稍候重试！");
                    else {
                        if (json.state === 0) {
                            document.getElementsByName("NickName")[0].value = "";
                            document.getElementsByName("Tel")[0].value = "";
                            document.getElementsByName("Question")[0].value = "";
                            let quickbtns = document.getElementsByClassName("mip-zhmsask")[0].getElementsByClassName("quickquestion");
                            for (let i = 0; i < quickbtns.length; i++) {
                                quickbtns[i].classList.remove("ct");
                            }
                            $this.Toast("咨询成功");
                        } else $this.Toast(json.msg || "咨询失败，请稍候重试！");

                    }



                });
            }


        })
    }

    Toast(info) {
        this.handleShow(null, info);
    }
    // tap事件封装
    tap(obj, callBack) {
        if (typeof obj !== 'object') return;
        // 变量
        var startTime = 0; // 记录触摸开始时间
        var isMove = false; // 记录是否产生移动
        obj.addEventListener('touchstart', function () {
            startTime = Date.now();
        });
        obj.addEventListener('touchmove', function () {
            isMove = true;
        });
        obj.addEventListener('touchend', function (e) {
            if (Date.now() - startTime < 300 && !isMove) {
                //触碰时间在300ms以内,不产生移动
                callBack && callBack(e);
            }
            // 清零
            startTime = 0;
            isMove = false;
        });
    }
    GetRadioValue(radioName) {
        var radios = document.getElementsByName(radioName);
        for (var i = 0; i < radios.length; i++) {
            var radio = radios.item(i);
            if (radio.checked) {
                if (!radio.value || radio.value.length <= 0) return undefined;
                return radio.value;
            }
        }
        return undefined;
    }


    // 
    update() {
        const { closeTime, infoIconSrc } = this.props;

        this.showTime = closeTime * 1000;

        if (!infoIconSrc) {
            this.show = false;
        } else {
            this.isBlock = true;
            this.hasPic = true;
        }
        setTimeout(() => {
            this.close = false;
            this.render();
        }, this.showTime);

        this.render()
    }
    handleShow(event, info) {
        const { infoText } = this.props;
        this.close = true;
        if (typeof info === 'string') {
            this.showToastText = info;
        } else {
            this.showToastText = infoText;
        }
        this.update();
    }

    handleHide() {
        this.close = false;
        this.render();
    }

    render() {
        const { station, infoIconSrc } = this.props;
        const wrapper = document.createElement('div');
        const fixed = document.createElement('mip-fixed');
        const toastWrapper = document.createElement('div');
        const toast = document.createElement('div');
        const toastImg = document.createElement('img');
        const toastText = document.createElement('p');

        wrapper.classList.add('wrapper');
        wrapper.appendChild(fixed);

        fixed.setAttribute('type', 'top');
        fixed.setAttribute('still', true);
        fixed.classList.add(station);

        if (!this.close) {
            fixed.style.display = 'none';
        }

        fixed.appendChild(toastWrapper);

        if (this.hasPic) {
            toastWrapper.classList.add('limit-width');
        }
        toastWrapper.appendChild(toast);

        toast.classList.add('toast');

        if (this.show) {
            toastImg.setAttribute('src', infoIconSrc);
            toastImg.classList.add('icon');
            toast.appendChild(toastImg);
        }

        toastText.innerText = this.showToastText;
        if (this.isBlock) {
            toastText.classList.add('block');
        }
        toast.appendChild(toastText);

        document.getElementById("toast-bar").innerHTML = '';
        document.getElementById("toast-bar").appendChild(wrapper);
    }
}
MIPZhmsaskv2.props = {
    infoIconSrc: {
        type: String,
        default: ''
    },
    infoText: {
        type: String,
        default: ''
    },
    closeTime: {
        type: Number,
        default: 3
    },
    station: {
        type: String,
        default: 'bottom'
    }
}
