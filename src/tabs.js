const _ = require("lodash")

/**
 * cllback
 * tabs.onTabActive = function (id, index, meta, $tab) 
 * tab.onTabClose = function(id, index, meta, $tab)
 */
class Tabs {

    constructor($container) {
        this.$container = $container
        this.itemMap = {}
        this.activeItemId = null
    }

    addTab(id, name, meta, active = true) {
        if (this.itemMap[id]) {
            this.activeTabById(id, true)
            return
        }

        let newIndex = _.size(this.itemMap)

        let $close = $('<span class="icon icon-cancel icon-close-tab"></span>')
        let $title = $("<span>", {
            class: "title",
            text: name
        })
        let $listItem = $("<div>", {
            class: "tab-item",
            data: {
                id,
                name,
                newIndex,
                meta
            }
        })
        let that = this
        $listItem.click(function () {
            let curId = $(this).data("id")
            that.activeTabById(curId, true)
        })

        $listItem.append($close)
        $listItem.append($title)
        // $listItem.text(name)
        this.$container.append($listItem)

        this.itemMap[id] = $listItem
        if (newIndex == 0 || active) {
            this.activeTabById(id, false)
        }
    }

    closeTab(id) {
        
    }

    activeTabById(id, isCallCB) {
        if (id == this.activeItemId) return

        let $tab = this.itemMap[id]
        if ($tab) {
            if(this.activeItemId){
                let $prevActiveItem = this.itemMap[this.activeItemId]
                $prevActiveItem.removeClass("active")
            }
            $tab.addClass("active")

            this.activeItemId = id

            if(isCallCB && this.onTabActive){
                let index = $tab.data("index")
                let meta = $tab.data("meta")
                this.onTabActive(id, index, meta, $tab)
            }
        }
    }
}

module.exports = Tabs