(function ($) {
    var DEFAULT_SETTINGS={
        minChars: 1,
        minLengthToCreate: 1,
        maxLengthToCreate: 30,
        propertyToSearch: "name",
        propertyKey: "id",
        propertyValue: "name",
        propertyToSelect: "select",
        propertyToReadOnly: "readonly",
        hideOnSelectDropdown: true,
        createItem: true,
        liveConnect: false,
        dropdownLimit: 3,
        selectedLimit: 5,
        setToHiddenInput: true,
        dropdownGap: 1,
        // Webservice
        webserviceUrl: "",
        method: "POST",
        contentType: "application/x-www-form-urlencoded:charset=UTF-8",
        customData: {},
        delay: 100,


        // Display settings
        searchingText: "در حال جستجو ...",
        noResultsText: "رکوردي يافت نشد",
        addBtnText: "افزودن",
        deleteIcon: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 43.94 43.94" style="width: 7px;height:7px;"><g><path d="m29.04,21.97l13.44-13.44c.94-.94,1.46-2.19,1.46-3.53s-.52-2.59-1.46-3.54c-.95-.94-2.2-1.46-3.54-1.46s-2.59.52-3.5,1.43l-13.23,13.71L8.53,1.46c-.94-.94-2.19-1.46-3.53-1.46S2.41.52,1.46,1.46c-.94.95-1.46,2.2-1.46,3.54s.52,2.59,1.43,3.5l13.95,13.47L1.46,35.41c-.94.94-1.46,2.19-1.46,3.53s.52,2.59,1.46,3.54c.95.94,2.2,1.46,3.54,1.46s2.59-.52,3.53-1.46l13.68-13.68,13.2,13.68c.94.94,2.19,1.46,3.53,1.46s2.59-.52,3.54-1.46c.94-.95,1.46-2.2,1.46-3.54s-.52-2.59-1.46-3.53l-13.44-13.44Z"/></g></g></svg>`,
        animateDropdown: true,
        placeholder: null,
        zindex: 999,
        hasImg: true,
        propertyImg: "img",
    }

    $.fn.barzegarSelect=function (options, data=function () { return [] }) {
        const id="brz_element_"+randomNumber(100000, 999999)
        const dropDownId="dropdown_"+id
        const inputId="input_"+id
        const wrapperId="wrapper_"+id
        const selectedWrapperId="selected_wrapper_"+id
        const infoDropDownId="info_dropdown_"+id
        const hiddenInputId="hidden_input_"+id
        const self=this
        var settings={}
        var initialized=false
        this.initPlugin=async (data) => {
            const wrapperElement=makeParentForMainElement()
            if (!settings.liveConnect) processFreshData(wrapperElement, data())
            else if (data().length) processFreshData(wrapperElement, data())
            if (!initialized) {
                initialized=true
                if (settings.setToHiddenInput) {
                    const hiddenInput=$("<input type='hidden' />")
                    hiddenInput.attr("id", hiddenInputId)
                    hiddenInput.val(JSON.stringify([]))
                    wrapperElement.append(hiddenInput)
                }
                $(window).on("scroll", () => { alignDropdown() })
                // Add event on focus wrapper element
                $(this).on("focus input", async function (e) {
                    // check if has limitation for add selected items 
                    var selectedCount=$(`#${selectedWrapperId} .${CLASSES.selectedItem}`).length
                    if (settings.selectedLimit!==null&&settings.selectedLimit<=selectedCount) {
                        $(this).blur()
                        $(this).val("")
                        $(this).attr("disabled", true)
                        $(`#${dropDownId}`).removeClass("show")
                        return
                    } else if ($(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`).length<1) {
                        if ($(`#${dropDownId}`).hasClass("show")) { $(`#${dropDownId}`).removeClass("show"), $(this).attr("disabled", false) }
                    } else {
                        $(this).attr("disabled", false)
                        $(`#${dropDownId}`).addClass("show")
                    }
                    if (settings.liveConnect) {
                        if ($(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`).length<1&&!pendingData) $(`#${dropDownId}`).removeClass("show")
                        else {
                            $(`#${dropDownId}`).addClass("show")
                            $(`#${dropDownId} ul li span`).each(function () {
                                const actualText=remove_html_tags($(this).html())
                                $(this).html(actualText)
                            })
                            $(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`).show(200)
                        }
                    }
                    setTimeout(() => { alignDropdown() }, 40)
                })
                let pendingData=false
                if (settings.liveConnect) {
                    $(this).on("keydown", function (event) {
                        switch (event.keyCode) {
                            case KEY_CODES.enter:
                                event.preventDefault()
                                if (remove_html_tags($(this).val().trim()??'').length>=settings.minLengthToCreate&&remove_html_tags($(this).val().trim()??'').length<=settings.maxLengthToCreate) {
                                    // add first item to selected items
                                    if (settings.createItem) {
                                        self.addSelectedItems({
                                            [settings.propertyKey]: remove_html_tags($(this).val().trim()??''), [settings.propertyValue]: remove_html_tags($(this).val().trim()??'')
                                        })
                                    } else {
                                        $(this).val("")
                                        $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                                    }
                                } else if (remove_html_tags($(this).val().trim()??'').length==0) {
                                    $(this).val("")
                                    $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                                }
                                break
                        }
                    })
                    var timeout
                    $(this).on("input", async function (e) {
                        var value=e.target.value
                        if (settings.minChars!==null&&value.length>=settings.minChars) {
                            pendingData=true
                            if (!document.getElementById(infoDropDownId)) {
                                var infoDropDown=$("<div  />")
                                infoDropDown.attr("id", infoDropDownId)
                                infoDropDown.addClass(CLASSES.dropdownInfo)
                                infoDropDown.text(settings.searchingText)
                                const dropdownWrapper=await self.createDropdown(wrapperElement, [])
                                dropdownWrapper.append(infoDropDown)
                                dropdownWrapper.addClass("show")
                            } else {
                                $(`#${infoDropDownId}`).text(settings.searchingText)
                                $(`#${infoDropDownId}`).addClass("show")
                            }
                            async function data(value) {
                                return new Promise((resolve, reject) => {
                                    $.ajax({
                                        url: settings.webserviceUrl,
                                        method: settings.method,
                                        processData: settings.processData,
                                        contentType: settings.contentType,
                                        data: $.extend({
                                            [settings.query]: value
                                        }, settings.customData), // merge default data with user data
                                        success: function (data) {
                                            resolve(data)
                                        },
                                        error: function (error) {
                                            reject(error)
                                        }
                                    })
                                })
                            }
                            if (timeout) clearTimeout(timeout)
                            timeout=setTimeout(async function () {
                                await processFreshData(wrapperElement, await data(value))
                            }, settings.delay)
                        }
                    })
                }
                wrapperElement.on("click focus", function () {
                    // Show dropdown menus
                    $(self).focus()
                })
            }
            return wrapperElement
        }

        var moreLength=0
        // in third argument gives type: "override" or "append" indicates that append to ul list of dropdown or override?!
        this.createDropdown=async (wrapperElement, data, type="override") => {
            if (settings.dropdownLimit!==null&&settings.dropdownLimit>0) {
                moreLength=data.length-settings.dropdownLimit
                data=data.slice(0, settings.dropdownLimit)
            }
            if (!document.getElementById(dropDownId)) {
                // create wrapper dropdown
                var dropdownWrapper=$("<div />")
                dropdownWrapper.attr("id", dropDownId)
                dropdownWrapper.addClass(CLASSES.dropdownWrapper)
                dropdownWrapper.css({
                    position: "absolute",
                    top: wrapperElement.offset().top+wrapperElement.outerHeight(true),
                    left: wrapperElement.offset().left,
                    width: wrapperElement.outerWidth()
                })
                var mainWrapperObserver=new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        alignDropdown()
                    })
                })
                mainWrapperObserver.observe(document.getElementById(wrapperId), {
                    attributes: false,
                    childList: true,
                    characterData: false,
                    subtree: true
                })
                var ulDropDown=$("<ul />")
                ulDropDown.append(this.makeDropdownItems(data))
                dropdownWrapper.html(ulDropDown)
                if (moreLength>0) {
                    if (!document.getElementById(infoDropDownId)) {
                        var infoDropDown=$("<div  />")
                        infoDropDown.attr("id", infoDropDownId)
                        infoDropDown.addClass(CLASSES.dropdownInfo)
                        infoDropDown.text(`${moreLength} مورد دیگر نیز وجود دارد.`)
                        dropdownWrapper.append(infoDropDown)
                    } else {
                        $(`#${infoDropDownId}`).text(`${moreLength} مورد دیگر نیز وجود دارد.`)
                    }
                } else {
                    if (document.getElementById(infoDropDownId)) document.getElementById(infoDropDownId).remove()
                }
                $(document.body).append(dropdownWrapper)
                var dropdownWrapperObserver=new MutationObserver(function (mutations) {
                    mutations.forEach(function (mutation) {
                        if ($(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`).length<1) {
                            if (dropdownWrapper.hasClass("show")) {
                                dropdownWrapper.removeClass("show")
                                $(self).focus()
                            }
                        }
                        else dropdownWrapper.addClass("show")
                    })
                })
                if (document.getElementById(dropDownId).querySelector("ul li")) {
                    dropdownWrapperObserver.observe(document.getElementById(dropDownId).querySelector("ul li"), {
                        attributes: false,
                        childList: true,
                        characterData: false,
                        subtree: true
                    })
                }
                return dropdownWrapper
            } else {
                if (type==="override") $(`#${dropDownId}`).find("ul").html(this.makeDropdownItems(data))
                else if (type==="append") $(`#${dropDownId}`).find("ul").append(this.makeDropdownItems(data))
                else throw new Error("Invalid value passed to 3rd argument.")
                if (moreLength>0) {
                    if (!document.getElementById(infoDropDownId)) {
                        var infoDropDown=$("<div  />")
                        infoDropDown.attr("id", infoDropDownId)
                        infoDropDown.addClass(CLASSES.dropdownInfo)
                        infoDropDown.text(`${moreLength} مورد دیگر نیز وجود دارد.`)
                        $(`#${dropDownId}`).append(infoDropDown)
                    } else {
                        $(`#${infoDropDownId}`).text(`${moreLength} مورد دیگر نیز وجود دارد.`)
                    }
                } else {
                    if (document.getElementById(infoDropDownId)) document.getElementById(infoDropDownId).remove()
                }
                return $(`#${dropDownId}`)
            }
        }

        let cachedData=[]
        var processFreshData=async (wrapperElement, data) => {
            if (settings.liveConnect) {
                // Check if data is fresh and not just like cached data
                pending=false
                if (!arraysAreEqual(await data, cachedData)) {
                    // Generate html for dropdown items and make it hidden
                    cachedData=await data
                    const dropdownWrapper=await this.createDropdown(wrapperElement, await data)
                    await processTheEvents(wrapperElement, dropdownWrapper)
                    return dropdownWrapper
                } else {
                    if (moreLength>0) {
                        if (!document.getElementById(infoDropDownId)) {
                            var infoDropDown=$("<div  />")
                            infoDropDown.attr("id", infoDropDownId)
                            infoDropDown.addClass(CLASSES.dropdownInfo)
                            infoDropDown.text(`${moreLength} مورد دیگر نیز وجود دارد.`)
                            $(`#${dropDownId}`).append(infoDropDown)
                        } else {
                            $(`#${infoDropDownId}`).text(`${moreLength} مورد دیگر نیز وجود دارد.`)
                        }
                    } else {
                        if (document.getElementById(infoDropDownId)) document.getElementById(infoDropDownId).remove()
                    }
                    return $(`#${dropDownId}`)
                }
            } else {
                if (!initialized) var dropdownWrapper=await this.createDropdown(wrapperElement, await data)
                else var dropdownWrapper=await this.createDropdown(wrapperElement, await data, "append")
                await processTheEvents(wrapperElement, dropdownWrapper)
                return dropdownWrapper
            }
        }

        let eventsProcessed=false
        var processTheEvents=async (wrapperElement, dropdownWrapper) => {
            if (!eventsProcessed) {
                let lastEnter=Date.now()
                // Instead of setting for document we setted to wrapperElement and dropdownWrapper!
                dropdownWrapper.on("keydown", function (event) {
                    var items=$(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`)
                    var focusedItem=$(`#${dropDownId} ul li.brz-focused:not(:hidden)`)
                    switch (event.keyCode) {
                        case KEY_CODES.arrowUp:
                            event.preventDefault()
                            if (focusedItem.length===0) {
                                items.first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            } else {
                                if (focusedItem.prevAll("li:not(.brz-selected):not(:hidden)").first().length)
                                    focusedItem.prevAll("li:not(.brz-selected):not(:hidden)").first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                                else if (!$(this).hasClass("dropup")) $(self).focus()
                            }
                            break
                        case KEY_CODES.arrowDown:
                            event.preventDefault()
                            if (focusedItem.length===0) {
                                items.first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            } else if (focusedItem.nextAll("li:not(.brz-selected):not(:hidden)").first().length) {
                                focusedItem.nextAll("li:not(.brz-selected):not(:hidden)").first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            } else if ($(this).hasClass("dropup")) $(self).focus()

                            break
                        case KEY_CODES.enter:
                        case KEY_CODES.tab:
                            event.preventDefault()
                            if (focusedItem.length>0) {
                                const value=focusedItem.find("span").text()??''
                                const key=focusedItem.data(settings.propertyKey)??''
                                const img=focusedItem.find("img").attr("src")??''
                                const readonly=focusedItem.data("readonly")
                                const currentEnter=Date.now()
                                if (currentEnter-lastEnter<40) {
                                    lastEnter=currentEnter
                                    return
                                }
                                lastEnter=currentEnter
                                let item={ [settings.propertyKey]: key, [settings.propertyValue]: value }
                                if (settings.hasImg) item[settings.propertyImg]=img
                                item[settings.propertyToReadOnly]=readonly
                                self.addSelectedItems(item)
                                focusedItem.addClass('brz-selected')
                                focusedItem.hide(200)
                                if (focusedItem.nextAll("li:not(:hidden)").first().length) {
                                    focusedItem.nextAll("li:not(:hidden)").first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                                } else {
                                    focusedItem.prevAll("li:not(:hidden)").first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                                }
                                var updatedItems=$(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`)
                                if (updatedItems.length<1) {
                                    dropdownWrapper.removeClass("show")
                                    $(self).focus()
                                }
                            }
                            break
                        case KEY_CODES.escape:
                            if (dropdownWrapper.hasClass("show")) {
                                event.preventDefault()
                                dropdownWrapper.removeClass("show")
                                $(self).focus()
                            }
                            break
                    }
                })

                $(this).on("keydown", function (event) {
                    var items=$(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`)
                    var selectedItems=$(`#${selectedWrapperId} .${CLASSES.selectedItem}`)
                    var selectedItem=$(`#${selectedWrapperId} .${CLASSES.selectedItem}:not([data-readonly]).brz-selected`)
                    var selected=$(`#${selectedWrapperId} .${CLASSES.selectedItem}.brz-selected`)
                    console.log(event.keyCode)
                    switch (event.keyCode) {
                        case KEY_CODES.arrowUp:
                            event.preventDefault()
                            if (!$(`#${dropDownId}`).hasClass("dropup")) items.first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            else items.last().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            break
                        case KEY_CODES.arrowDown:
                            event.preventDefault()
                            if (!$(`#${dropDownId}`).hasClass("dropup")) items.first().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            else items.last().focus().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                            break
                        case KEY_CODES.backspace:
                            if ($(self).val().length===0) {
                                const currentEnter=Date.now()
                                if (currentEnter-lastEnter<35) {
                                    lastEnter=currentEnter
                                    return
                                }
                                lastEnter=currentEnter
                                // selected all items
                                if (selectedItem.length>1) {
                                    selectedItem.each(function () {
                                        self.removeSelectedItem($(this).data(settings.propertyKey))
                                    })
                                } else {
                                    // remove last item from selected items
                                    self.removeLastSelectedItem()
                                }
                                // show all unselected items
                                $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                                $(self).attr("disabled", false)
                            }
                            break
                        case KEY_CODES.tab:
                            if (items.length&&$(`#${dropDownId}`).hasClass("show")) {
                                event.preventDefault()
                                const firstItem=items.first()
                                const value=firstItem.find("span").text()??''
                                const key=firstItem.data(settings.propertyKey)??''
                                const img=firstItem.find("img").attr("src")??''
                                const readonly=firstItem.data("readonly")
                                let item={ [settings.propertyKey]: key, [settings.propertyValue]: value }
                                if (settings.hasImg) item[settings.propertyImg]=img
                                item[settings.propertyToReadOnly]=readonly
                                self.addSelectedItems(item)
                                firstItem.addClass('brz-selected')
                                firstItem.hide(200)
                                firstItem.next().addClass("brz-focused").siblings().removeClass("brz-focused").blur()
                                var updatedItems=$(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`)
                                if (updatedItems.length<1) {
                                    dropdownWrapper.removeClass("show")
                                    $(self).focus()
                                }
                                else dropdownWrapper.addClass("show")
                            }
                            break
                        case KEY_CODES.escape:
                            if (dropdownWrapper.hasClass("show")) {
                                event.preventDefault()
                                $(self).focus()
                                dropdownWrapper.removeClass("show")
                            }
                            break
                        case KEY_CODES.space:
                            if (!dropdownWrapper.hasClass("show")&&event.ctrlKey) {
                                event.preventDefault()
                                dropdownWrapper.addClass("show")
                            }
                            break
                        case KEY_CODES.enter:
                            event.preventDefault()
                            if (remove_html_tags($(self).val().trim()??'').length>=settings.minLengthToCreate&&remove_html_tags($(self).val().trim()??'').length<=settings.maxLengthToCreate) {
                                // add first item to selected items
                                if (settings.createItem) {
                                    self.addSelectedItems({
                                        [settings.propertyKey]: remove_html_tags($(self).val().trim()??''), [settings.propertyValue]: remove_html_tags($(self).val().trim()??'')
                                    })
                                } else {
                                    $(this).val("")
                                    $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                                }
                            } else if (remove_html_tags($(self).val().trim()??'').length==0) {
                                $(self).val("")
                                $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                            }
                            break
                        case KEY_CODES.arrowRight:
                            event.preventDefault()
                            if (selectedItem.length) {
                                selectedItem.prevAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().focus().addClass("brz-selected").siblings().removeClass("brz-selected").blur()
                            } else {
                                selectedItems.last().focus().addClass("brz-selected")
                            }
                            $(self).focus()
                            break
                        case KEY_CODES.arrowLeft:
                            event.preventDefault()
                            if (selectedItem.nextAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().length) {
                                selectedItem.nextAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().focus().addClass("brz-selected").siblings().removeClass("brz-selected").blur()
                            } else {
                                selectedItems.last().blur().removeClass("brz-selected")
                            }
                            $(self).focus()
                            break
                        case KEY_CODES.delete:
                            event.preventDefault()
                            if (selectedItem.length) {
                                self.removeSelectedItem(selectedItem.data(settings.propertyKey))
                            }
                            else {
                                selectedItem=selected.nextAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first()
                                selectedItem.nextAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().focus().addClass("brz-selected").siblings().removeClass("brz-selected").blur()
                                self.removeSelectedItem(selectedItem.data(settings.propertyKey))
                            }
                            $(self).attr("disabled", false)
                            $(self).focus()
                            break
                        case KEY_CODES.A:
                            if ($(this).val().length<1&&event.ctrlKey) {
                                event.preventDefault()
                                $(`#${selectedWrapperId} .${CLASSES.selectedItem}:not([data-readonly])`).addClass("brz-selected")
                            }
                            break
                    }
                })

                if (!settings.liveConnect) {
                    $(this).on("input", async function (event) {
                        const value=event.target.value
                        $(`#${dropDownId} ul li`).removeClass("brz-focused").blur()
                        $(`#${dropDownId} ul li:not(.brz-selected) span`).each(async function () {
                            if (value.length) {
                                const actualText=$(this).text()
                                const searchText=find_value_and_highlight_term(actualText, $(this).text(), value)
                                if (searchText!==actualText) {
                                    $(this).html(searchText)
                                    $(this).parent().show(200)
                                } else {
                                    const actualText=remove_html_tags($(this).html())
                                    $(this).html(actualText)
                                    $(this).parent().hide(200)
                                }
                            } else {
                                const actualText=remove_html_tags($(this).html())
                                $(this).html(actualText)
                                $(this).parent().show(200)
                            }
                        })
                        if ($(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`).length<1) $(`#${dropDownId}`).removeClass("show")
                    })
                }

                $(`#${dropDownId} ul li`).on("click", function () {
                    // check if has limitation for add selected items 
                    var selectedCount=0
                    $(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                        selectedCount++
                    })
                    if (settings.selectedLimit!==null&&settings.selectedLimit<=selectedCount) return
                    const value=$(this).find("span").text()??''
                    const key=$(this).data(settings.propertyKey)??''
                    const img=$(this).find("img").attr("src")??''
                    const readonly=$(this).data("readonly")
                    let item={ [settings.propertyKey]: key, [settings.propertyValue]: value }
                    if (settings.hasImg) item[settings.propertyImg]=img
                    item[settings.propertyToReadOnly]=readonly
                    self.addSelectedItems(item)
                    $(this).addClass('brz-selected')
                    $(this).hide(200)
                    var updatedItems=$(`#${dropDownId} ul li:not(.brz-selected):not(:hidden)`)
                    if (updatedItems.length<1) {
                        dropdownWrapper.removeClass("show")
                        $(self).focus()
                    }
                })
                $(document).on("click", function (event) {
                    if ($(event.target).closest(`#${dropDownId}`).length===0&&$(event.target).closest(`#${wrapperId}`).length===0) {
                        $(`#${dropDownId}`).removeClass("show")
                    }
                    if ($(event.target).closest(`#${selectedWrapperId} .${CLASSES.selectedItem}`).length===0) {
                        $(`#${selectedWrapperId} .${CLASSES.selectedItem}`).removeClass("brz-selected").blur()
                    }
                })
                eventsProcessed=true
            } else {
                dropdownWrapper.unbind("keydown")
                $(`#${dropDownId} ul li`).unbind("click")
                $(this).unbind("keydown")
                eventsProcessed=false
                await processTheEvents(wrapperElement, dropdownWrapper)
            }
        }

        this.makeDropdownItems=(data) => {
            if (Object.prototype.toString.call(data)==='[object Array]') {
                var liDropDownItems=[]
                if (data.length) {
                    for (var item of data) {
                        // check if key exists in the dropdown, so return.
                        var keyExist=false
                        liDropDownItems.forEach((elem, i) => {
                            if (elem.attr("data-"+settings.propertyKey)==item[settings.propertyKey]) keyExist=true
                        })
                        if (keyExist) continue
                        var liDropDown=$("<li />")
                        // check if key exists in the selected items, so return.
                        var keyExist=false
                        $(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                            if ($(this).attr(`data-${settings.propertyKey}`)==item[settings.propertyKey]) keyExist=true
                        })
                        if (keyExist) {
                            liDropDown.hide()
                            liDropDown.addClass("brz-selected")
                        }
                        // check if has img
                        if (settings.hasImg&&item[settings.propertyImg]) {
                            var imgDropDown=$("<img  />")
                            imgDropDown.attr("src", item[settings.propertyImg])
                            imgDropDown.attr("width", 24)
                            imgDropDown.attr("height", 24)
                            imgDropDown.attr("alt", item[settings.propertyValue])
                            liDropDown.append(imgDropDown)
                        }
                        var spanDropDown=$("<span  />")
                        spanDropDown.text(item[settings.propertyValue])
                        liDropDown.append(spanDropDown)
                        liDropDown.attr("tabindex", "1")
                        liDropDown.attr("title", item[settings.propertyValue])
                        liDropDown.attr("data-"+settings.propertyKey, item[settings.propertyKey])
                        liDropDown.hover(function () {
                            $(this).addClass("brz-focused").siblings().removeClass("brz-focused")
                        })
                        liDropDown.mouseleave(function () {
                            $(this).removeClass("brz-focused")
                        })
                        if (item[settings.propertyToReadOnly]) liDropDown.attr("data-readonly", true)
                        else liDropDown.attr("data-readonly", false)
                        liDropDownItems.push(liDropDown)
                        if (item[settings.propertyToSelect]) {
                            liDropDown.addClass("brz-selected")
                            liDropDown.hide()
                            this.addSelectedItems(item)
                        }
                    }
                }
                return liDropDownItems
            } else if (typeof data==='object'&&data.constructor===Object) {
                // check if key exists in the dropdown, so return.
                var keyExist=false
                liDropDownItems.forEach((elem, i) => {
                    if (elem.attr("data-"+settings.propertyKey)==data[settings.propertyKey]) keyExist=true
                })
                if (!keyExist) {
                    var liDropDown=$("<li />")
                    // check if key exists in the selected items, so return.
                    var keyExist=false
                    $(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                        if ($(this).attr(`data-${settings.propertyKey}`)==data[settings.propertyKey]) keyExist=true
                    })
                    if (keyExist) {
                        liDropDown.hide()
                        liDropDown.addClass("brz-selected")
                    }
                    // check if has img
                    if (settings.hasImg&&data[settings.propertyImg]) {
                        var imgDropDown=$("<img  />")
                        imgDropDown.attr("src", data[settings.propertyImg])
                        imgDropDown.attr("width", 24)
                        imgDropDown.attr("height", 24)
                        imgDropDown.attr("alt", data[settings.propertyValue])
                        liDropDown.append(imgDropDown)
                    }
                    var spanDropDown=$("<span  />")
                    spanDropDown.text(data[settings.propertyValue])
                    liDropDown.append(spanDropDown)
                    liDropDown.attr("tabindex", "1")
                    liDropDown.attr("title", data[settings.propertyValue])
                    liDropDown.attr("data-"+settings.propertyKey, data[settings.propertyKey])
                    liDropDown.hover(function () {
                        $(this).addClass("brz-focused").siblings().removeClass("brz-focused")
                    })
                    liDropDown.mouseleave(function () {
                        $(this).removeClass("brz-focused")
                    })
                    if (data[settings.propertyToReadOnly]) liDropDown.attr("data-readonly", true)
                    else liDropDown.attr("data-readonly", false)
                    liDropDownItems.push(liDropDown)
                    if (data[settings.propertyToSelect]) {
                        this.addSelectedItems(data)
                    }
                    return liDropDown
                } else return {}
            } else {
                throw new Error("آرگومان نامعتبری وارد کرده اید!")
            }
        }

        this.addDropdownItems=(data) => {
            if (Object.prototype.toString.call(data)==='[object Array]') {
                this.initPlugin(() => data)
            } else if (typeof data==='object'&&data.constructor===Object) {
                this.initPlugin(() => [data])
            } else {
                throw new Error("آرگومان نامعتبری وارد کرده اید!")
            }
        }

        this.addSelectedItems=(data) => {
            if (Object.prototype.toString.call(data)==='[object Array]') {
                data.forEach(data => {
                    // Check is exist with this key in dropdown return;
                    var isExists=false
                    var selectedCount=0
                    $(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                        selectedCount++
                        if ($(this).attr(`data-${settings.propertyKey}`)===data[settings.propertyKey])
                            isExists=true
                    })
                    if (isExists) {
                        handleDuplicate(data)
                        return
                    }
                    // check if has limitation for add selected items 
                    if (settings.selectedLimit!==null&&settings.selectedLimit<=selectedCount) return
                    var selectedItem=$("<div  />")
                    selectedItem.addClass(CLASSES.selectedItem)
                    selectedItem.attr(`data-${settings.propertyKey}`, data[settings.propertyKey])
                    selectedItem.attr("tabindex", 1)
                    // check the selected item is readonly??
                    if (data[settings.propertyToReadOnly]) selectedItem.attr("data-readonly", "")
                    // check selected item has img??
                    if (settings.hasImg&&data[settings.propertyImg]) {
                        var imgSelected=$("<img  />")
                        imgSelected.attr("src", data[settings.propertyImg])
                        imgSelected.attr("width", 20)
                        imgSelected.attr("height", 20)
                        imgSelected.attr("alt", data[settings.propertyValue])
                        selectedItem.append(imgSelected)
                    }
                    var spanSelectedItem=$("<span />")
                    spanSelectedItem.text(data[settings.propertyValue])
                    var removeSelectedIcon=$("<i  />")
                    removeSelectedIcon.html(settings.deleteIcon)
                    removeSelectedIcon.attr("brz-selected-remove", "")
                    selectedItem.append(spanSelectedItem)
                    selectedItem.append(removeSelectedIcon)
                    $(`#${selectedWrapperId}`).append(selectedItem)
                    $(`#${wrapperId} .${CLASSES.mainElementInput}`).val("")
                    $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                    processTheEventsForSelectedItem(selectedItem)
                    $(`#${dropDownId}`).find(`ul li`).each(function () {
                        if ($(this).attr(`data-${settings.propertyKey}`)===selectedItem.attr(`data-${settings.propertyKey}`))
                            $(this).hide(200).addClass('brz-selected').removeClass("brz-focused")
                    })
                    processValues()
                })
            } else if (typeof data==='object'&&data.constructor===Object) {
                // Check is exist with this key in dropdown return;
                var isExists=false
                var selectedCount=0
                $(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                    selectedCount++
                    if ($(this).attr(`data-${settings.propertyKey}`)===data[settings.propertyKey])
                        isExists=true
                })
                if (isExists) {
                    handleDuplicate(data)
                    return
                }
                // check if has limitation for add selected items 
                if (settings.selectedLimit!==null&&settings.selectedLimit<=selectedCount) return
                var selectedItem=$("<div  />")
                selectedItem.addClass(CLASSES.selectedItem)
                selectedItem.attr(`data-${settings.propertyKey}`, data[settings.propertyKey])
                selectedItem.attr("tabindex", 1)
                // check the selected item is readonly??
                if (data?.readonly) selectedItem.attr("data-readonly", "")
                // check selected item has img??
                if (settings.hasImg&&data[settings.propertyImg]) {
                    var imgSelected=$("<img  />")
                    imgSelected.attr("src", data[settings.propertyImg])
                    imgSelected.attr("width", 20)
                    imgSelected.attr("height", 20)
                    imgSelected.attr("alt", data[settings.propertyValue])
                    selectedItem.append(imgSelected)
                }
                var spanSelectedItem=$("<span />")
                spanSelectedItem.text(data[settings.propertyValue])
                var removeSelectedIcon=$("<i  />")
                removeSelectedIcon.html(settings.deleteIcon)
                removeSelectedIcon.attr("brz-selected-remove", "")
                selectedItem.append(spanSelectedItem)
                if (!data[settings.propertyToReadOnly]) selectedItem.append(removeSelectedIcon)
                $(`#${selectedWrapperId}`).append(selectedItem)
                $(`#${wrapperId} .${CLASSES.mainElementInput}`).val("")
                $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                processTheEventsForSelectedItem(selectedItem)
                $(`#${dropDownId}`).find(`ul li`).each(function () {
                    if ($(this).attr(`data-${settings.propertyKey}`)===selectedItem.attr(`data-${settings.propertyKey}`))
                        $(this).hide(200).addClass('brz-selected').removeClass("brz-focused")
                })
                processValues()
            } else {
                throw new Error("آرگومان نامعتبری وارد کرده اید!")
            }
        }

        this.removeLastSelectedItem=() => {
            // find last not readonly selected item!
            var lastSelectedItem=$(`#${selectedWrapperId} .${CLASSES.selectedItem}:not([data-readonly])`).last()
            lastSelectedItem.prevAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().focus().addClass("brz-selected").siblings().removeClass("brz-selected").blur()
            lastSelectedItem.remove()
            $(`#${dropDownId}`).find(`ul li`).each(function () {
                if ($(this).attr(`data-${settings.propertyKey}`)===lastSelectedItem.attr(`data-${settings.propertyKey}`))
                    $(this).show(200).removeClass('brz-selected').addClass("brz-focused").siblings().removeClass("brz-focused")
            })
            $(`#${wrapperId} .${CLASSES.mainElementInput}`).focus()
            processValues()

        }

        this.removeSelectedItem=(id) => {
            // get not readonly selected item
            const selectedItem=$(`#${selectedWrapperId} .${CLASSES.selectedItem}:not([data-readonly])`).map(function () {
                if ($(this).attr(`data-${settings.propertyKey}`)==id) {
                    return $(this)
                }
            }).get(0)
            if (selectedItem) {
                if (selectedItem.nextAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().length) {
                    selectedItem.nextAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().focus().addClass("brz-selected").siblings().removeClass("brz-selected").blur()
                } else if (selectedItem.prevAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().length) {
                    selectedItem.prevAll(`.${CLASSES.selectedItem}:not([data-readonly])`).first().focus().addClass("brz-selected").siblings().removeClass("brz-selected").blur()
                }
                $(self).attr("disabled", false)
                selectedItem.remove()
                $(`#${dropDownId}`).find(`ul li`).each(function () {
                    if ($(this).attr(`data-${settings.propertyKey}`)===selectedItem.attr(`data-${settings.propertyKey}`))
                        $(this).show(200).removeClass('brz-selected').addClass("brz-focused").siblings().removeClass("brz-focused")
                })
                $(`#${wrapperId} .${CLASSES.mainElementInput}`).focus()
                processValues()
                return true
            }
            return false
        }

        // if remove selected is true, so removes the its related selected item even!
        this.removeDropdownItem=(id, removeSelected=true) => {
            const dropdownItem=$(`#${dropDownId} ul li`).map(function () {
                if ($(this).attr(`data-${settings.propertyKey}`)==id) {
                    return $(this)
                }
            }).get(0)
            dropdownItem.remove()
            if (removeSelected) {
                $(`#${selectedWrapperId}`).find(`.${CLASSES.selectedItem}`).each(function () {
                    if ($(this).attr(`data-${settings.propertyKey}`)===dropdownItem.attr(`data-${settings.propertyKey}`))
                        $(this).remove()
                })
            }
            processValues()
        }

        var makeParentForMainElement=() => {
            if (!document.getElementById(wrapperId)) {
                var elementWrapper=$("<div />")
                elementWrapper.attr("id", wrapperId)
                elementWrapper.addClass(CLASSES.mainElementWrapper+" "+$(self).attr("class"))
                elementWrapper.insertAfter($(this))
                var selectedWrapper=$("<div  />")
                selectedWrapper.attr("id", selectedWrapperId)
                selectedWrapper.addClass(CLASSES.selectedWrapper)
                elementWrapper.html(selectedWrapper)
                $(this).remove()
                $(this).removeClass()
                $(this).addClass(CLASSES.mainElementInput)
                $(this).attr("autocomplete", "off")
                elementWrapper.append($(this))
                if (settings.createItem) {
                    var buttonAdd=$(`<button type='button' class='${CLASSES.addBtn}'  />`)
                    buttonAdd.text(settings.addBtnText)
                    buttonAdd.on("click", function (event) {
                        event.preventDefault()
                        if (remove_html_tags($(self).val().trim()??'').length>=settings.minLengthToCreate&&remove_html_tags($(self).val().trim()??'').length<=settings.maxLengthToCreate) {
                            // add first item to selected items
                            if (settings.createItem) {
                                self.addSelectedItems({
                                    [settings.propertyKey]: remove_html_tags($(self).val().trim()??''), [settings.propertyValue]: remove_html_tags($(self).val().trim()??'')
                                })
                            } else {
                                $(this).val("")
                                $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                            }
                        } else if (remove_html_tags($(self).val().trim()??'').length==0) {
                            $(self).val("")
                            $(`#${dropDownId} ul li:not(.brz-selected)`).show(200)
                        }
                    })
                    elementWrapper.append(buttonAdd)
                }
                return elementWrapper
            } else {
                return $(`#${wrapperId}`)
            }
        }

        let lastSelectedItems=[]
        var processValues=() => {
            const wrapperElement=$(`#${wrapperId}`)
            var selectedItems=[]
            wrapperElement.find(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                var key=$(this).data(settings.propertyKey)??""
                var value=$(this).find("span").text()??""
                if (!settings.hasImg) {
                    selectedItems.push({ [settings.propertyKey]: key, [settings.propertyValue]: value })
                } else {
                    var img=$(this).find("img").attr("src")??""
                    selectedItems.push({ [settings.propertyKey]: key, [settings.propertyValue]: value, [settings.propertyImg]: img })
                }
            })

            if (!arraysAreEqual(selectedItems, lastSelectedItems)) {
                // check to create and set data to hidden input
                if (settings.setToHiddenInput) {
                    if ($(`#${hiddenInputId}`).length) {
                        $(`#${hiddenInputId}`).val(JSON.stringify(selectedItems))
                    }
                }
                self.trigger("brzChange", { data: selectedItems })
                lastSelectedItems=selectedItems
            }
            return selectedItems
        }

        this.getValue=() => {
            const wrapperElement=$(`#${wrapperId}`)
            var selectedItems=[]
            wrapperElement.find(`#${selectedWrapperId} .${CLASSES.selectedItem}`).each(function () {
                var key=$(this).data(settings.propertyKey)??""
                var value=$(this).find("span").text()??""
                if (!settings.hasImg) {
                    selectedItems.push({ [settings.propertyKey]: key, [settings.propertyValue]: value })
                } else {
                    var img=$(this).find("img").attr("src")??""
                    selectedItems.push({ [settings.propertyKey]: key, [settings.propertyValue]: value, [settings.propertyImg]: img })
                }
            })
            return selectedItems
        }

        var alignDropdown=() => {
            const { innerHeight }=window
            const wrapperElement=$(`#${wrapperId}`)
            $(`#${dropDownId}`).each(function () {
                const wrapperElementTop=wrapperElement.offset().top
                const totalHeight=wrapperElementTop+wrapperElement.outerHeight(true)
                if (totalHeight>innerHeight/1.6) {
                    if (!$(this).hasClass("dropup")) {
                        $(this).addClass("dropup")
                    }
                    $(this).css({
                        position: "absolute",
                        top: "auto",
                        bottom: innerHeight-wrapperElement.offset().top+settings.dropdownGap,
                        left: wrapperElement.offset().left,
                        width: wrapperElement.outerWidth()
                    })
                } else {
                    if ($(this).hasClass("dropup")) {
                        $(this).removeClass("dropup")
                    }
                    $(this).css({
                        position: "absolute",
                        top: wrapperElement.offset().top+wrapperElement.outerHeight(true)+settings.dropdownGap,
                        bottom: "auto",
                        left: wrapperElement.offset().left,
                        width: wrapperElement.outerWidth()
                    })
                }
            })
        }

        var processTheEventsForSelectedItem=(selectedItem) => {
            selectedItem.on("click", function () {
                $(this).addClass("brz-selected").siblings().removeClass("brz-selected")
            })
            selectedItem.find("[brz-selected-remove]").on("click", function (event) {
                self.removeSelectedItem(selectedItem.attr(`data-${settings.propertyKey}`))
            })
        }

        // Initialize app 
        settings=$.extend({}, DEFAULT_SETTINGS, options||{})

        this.initPlugin(data)

        return this
    }

    var CLASSES={
        dropdownWrapper: "brz-dropdown-wrapper",
        mainElementWrapper: "brz-element-wrapper",
        selectedWrapper: "brz-selected-wrapper",
        selectedItem: "brz-selected-item",
        mainElementInput: "brz-main-element-input",
        dropdownInfo: "brz-dropdown-info",
        addBtn: "brz-add-btn"
    }

    var KEY_CODES={
        backspace: 8,
        tab: 9,
        enter: 13,
        escape: 27,
        space: 32,
        arrowLeft: 37,
        arrowUp: 38,
        arrowRight: 39,
        arrowDown: 40,
        delete: 46,
        A: 65
    }

    function randomNumber(min, max) {
        return Math.round(Math.random()*(max-min)+min)
    }

    var regexp_special_chars=new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g')
    function regexp_escape(term) {
        return term.replace(regexp_special_chars, '\\$&')
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(
            new RegExp(
                "(?![^&;]+;)(?!<[^<>]*)("+regexp_escape(term)+")(?![^<>]*>)(?![^&;]+;)",
                "gi"
            ), function (match, p1) {
                return "<b>"+p1+"</b>"
            }
        )
    }

    function remove_html_tags(value) {
        return value.replace(/(<([^>]+)>)/ig, '').replace(/["']/g, "")
    }

    function find_value_and_highlight_term(template, value, term) {
        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)("+regexp_escape(value)+")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term))
    }

    function handleDuplicate(data) {
        // console.log('duplicates', data)
    }

    // Helper function 
    function arraysAreEqual(array1, array2) {
        // Check if the arrays have the same length
        if (array1.length!==array2.length) return false

        // sort the arrays 
        array1.sort()
        array2.sort()

        // compare the sorted arrays
        for (let i=0; i<array1.length; i++) {
            if (JSON.stringify(array1[i])!==JSON.stringify(array2[i])) return false
        }
        return true
    }
}(jQuery))