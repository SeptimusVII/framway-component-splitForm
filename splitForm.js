module.exports = function(app){
    var SplitForm = Object.getPrototypeOf(app).SplitForm = new app.Component("splitForm");
    // SplitForm.debug = true;
    SplitForm.createdAt      = "2.0.0";
    SplitForm.lastUpdate     = "2.4.0";
    SplitForm.version        = "1.0.2";
    // SplitForm.factoryExclude = true;
    // SplitForm.loadingMsg     = utils.checkForm === undefined ? "utils.checkForm function is not defined" : false;
    // SplitForm.requires       = [];

    SplitForm.prototype.onCreate = function(){
        var form = this;
        form.enableNav      ??= form.getData('enablenav',true);
        form.renderErrors   ??= form.getData('rendererrors','text');
        form.$wrapper       = form.$el.find('.splitForm__sections');
        form.$sections      = form.$el.find('.splitForm__section');
        form.$nav           = form.$el.find('.splitForm__nav').length       ? form.$el.find('.splitForm__nav') : $('<div class="splitForm__nav"></div>').prependTo(form.$el);
        form.$actions       = form.$el.find('.splitForm__actions').length   ? form.$el.find('.splitForm__nav') : $(`
            <div class="splitForm__actions">
                <button type="button" data-dir="prev"  class="splitForm__action step icon-first hidden"><i class="fa fa-arrow-left"></i>${app.labels.buttons.prev[app.lang]}</button>
                <button type="button" data-dir="next"  class="splitForm__action step icon-last "><i class="fa fa-arrow-right"></i>${app.labels.buttons.next[app.lang]}</button>
                <button type="button" data-dir="final" class="splitForm__action step icon-last hidden btn-bd-primary"><i class="fa fa-check"></i>${app.labels.buttons.send[app.lang]}</button>
            </div>
        `).appendTo(form.$el);
        if (form.renderErrors === 'text')
            form.$sections.each(function(s,section){$('<div class="error-container"></div>').appendTo(section)});
        if (form.renderErrors !== false)
            form.renderErrors = true;

        // callbacks
        form.onPrev  = (window[form.getData('onprev')] !== undefined)  ? window[form.getData('onprev')]   : function(){ form.log('onPrev'); };
        form.onNext  = (window[form.getData('onnext')] !== undefined)  ? window[form.getData('onnext')]   : function(){ form.log('onNext'); };
        form.onFinal = (window[form.getData('onfinal')] !== undefined) ? window[form.getData('onfinal')]  : function(){ form.log('onFinal'); };

        form.$sections.first().addClass('active');
        form.$sections.each(function(s,section){
            if (!form.$nav.find('.splitForm__navitem[data-step="'+s+'"]').length)
                form.$nav.append($('<div class="splitForm__navitem '+(s==0?'active':'deactivate')+'" data-step="'+s+'"><span class="number">'+(s+1)+'</span><span class="ellipsis"><span class="number">'+(s+1)+'.</span> '+$(section).data('title')+'</span></div>'));
        });

        form.$actions.find('.splitForm__action').on('click',function(){
            form.log('action click', this);
            var checkStep = utils.checkForm(form.$sections.filter('.active'),form.renderErrors);
            if($(this).attr('data-dir') != 'prev'){ // action is either next or final
                if (checkStep.valid === false) {
                    form.$sections.filter('.active').removeClass('complete');
                    form.$wrapper.removeClass('isComplete');
                } else { 
                    form.$sections.filter('.active').addClass('complete');
                }
                // form.$sections.filter('.active').addClass('complete'); // DEBUG
            }
            if($(this).attr('data-dir') != 'final'){ // action is either prev or next
                form.switchStep($(this).attr('data-dir'));
            }
            else if($(this).attr('data-dir') == 'final' && form.$sections.filter('.active').hasClass('complete')){ // action is final, and form is valid
                if(checkStep.valid){
                    // do the final thing
                    form.$nav.find('.splitForm__navitem.active').addClass('complete');
                    form.$wrapper.addClass('isComplete');
                    form.onFinal();
                }
            }

        });
        if (form.enableNav === true) {
            form.$nav.find('.splitForm__navitem').on('click',function(){
                form.log('nav item click', this);
                if (!$(this).hasClass('complete') && !$(this).prev().hasClass('complete'))
                    return false;
                var posNext = form.$nav.find(this).index('.splitForm__navitem:not(.hide)') - form.$nav.find('.active').index('.splitForm__navitem:not(.hide)');
                if (posNext < 0)
                    for (var i = 0; i > posNext; i--)
                        form.switchStep('prev');
                else{
                    var checkStep = utils.checkForm(form.$sections.filter('.active'),form.renderErrors);
                    if (checkStep.valid === true) {
                        form.$sections.filter('.active').addClass('complete');
                        for (var i = 0; i < posNext; i++)
                            form.switchStep('next');
                    } else {
                        form.$sections.filter('.active').removeClass('complete');
                        form.$wrapper.removeClass('isComplete');
                    }
                } 
            });
        }

        // set events for conditional fields
        form.$el.find('input,select,textarea').filter('[data-conditional]').each(function(i,input){
            var config = {
                inputRef    : form.$el.find('input,select,textarea').filter('[name="'+input.getAttribute('data-conditional').split('/')[0]+'"]'),
                targetValue : input.getAttribute('data-conditional').split('/')[1] || false,
                required    : (input.getAttribute('data-conditional').split('/')[2] === 'required' || input.getAttribute('data-conditional').split('/')[2] === 'all') || false,
                hide        : (input.getAttribute('data-conditional').split('/')[2] === 'hide'     || input.getAttribute('data-conditional').split('/')[2] === 'all') || false,
            }
            config.inputRef.on('change',function(){
                if (this.value == config.targetValue) {
                    if (config.required === true)
                        input.setAttribute('required',true);
                    if (config.hide === true)
                        form.hideInput(input,false);
                        
                } else {
                    if (config.required === true)
                        input.removeAttribute('required');
                    if (config.hide === true)
                        form.hideInput(input,true);
                }
            }).trigger('change');
        });

        // things to do if there is only one step
        if (form.$sections.length <= 1){
            form.$nav.addClass('hidden');
        }

        form.log('created');
    }
    SplitForm.prototype.hideSection = function(section,hide=true){
        var form = this;
        var index = form.$sections.toArray().indexOf($(section).get(0));
        if (hide === true) {
            $(section).addClass('hide');
            form.$nav.find('.splitForm__navitem[data-step='+(index)+']').addClass('hide');
        } else if(hide === false){
            $(section).removeClass('hide');
            form.$nav.find('.splitForm__navitem[data-step='+(index)+']').removeClass('hide');  
        }
    }
    SplitForm.prototype.hideInput = function(input,hide=true){
        if (hide === true && !$(input).closest('.hide').length) {
            if ($(input).closest('.form-group').length)
                $(input).closest('.form-group').addClass('hide');
            else if ($(input).closest('.input-group').length)
                $(input).closest('.input-group').wrap('<div class="hide"></div>');
            else if ($(input).closest('.select2FW-wrapper').length)
                $(input).closest('.select2FW-wrapper').wrap('<div class="hide"></div>');
            else
                $(input).wrap('<div class="hide"></div>');
        } else if(hide === false && $(input).closest('.hide').length){
            if ($(input).closest('.form-group').length)
                $(input).closest('.form-group').removeClass('hide');
            else if ($(input).closest('.input-group').length)
                $(input).closest('.input-group').unwrap('.hide');
            else if ($(input).closest('.select2FW-wrapper').length)
                $(input).closest('.select2FW-wrapper').unwrap('.hide');
            else
                $(input).unwrap('.hide');
        }
    }
    SplitForm.prototype.switchStep = function(dir){
        var form = this;
        return new Promise(function(resolve,reject){
            var $sections = form.$sections.filter(':not(.deactivate)').filter(':not(.hide)');
            var $navItems = form.$nav.find('.splitForm__navitem').filter(':not(.hide)');
            var current = $sections.toArray().indexOf(form.$sections.filter('.active').get(0));
            var next;
            if (dir == "prev" && current != 0)
                next = current-1;
            else if(dir == "next" && current != $sections.length-1)
                next = current+1;
            if(dir == 'prev' || (dir == 'next' && $sections.eq(current).hasClass('complete'))){
                $sections.removeClass('active');
                $sections.eq(next).addClass('active');

                form.$actions.find('.step').removeClass('hidden');
                if(next == 0){ // first
                    form.$actions.find('.step[data-dir="prev"]').addClass('hidden');
                    // if (!form.$wrapper.hasClass('isComplete'))
                        form.$actions.find('.step[data-dir="final"]').addClass('hidden');
                }
                if(next == $sections.length-1){ // last
                    form.$actions.find('.step[data-dir="next"]').addClass('hidden');
                } else { // others
                    // if (!form.$wrapper.hasClass('isComplete'))
                        form.$actions.find('.step[data-dir="final"]').addClass('hidden');
                }
                $navItems.removeClass('active');
                // $navItems.filter('[data-step='+(next)+']').removeClass('deactivate').addClass('active').prevAll().addClass('complete');
                $navItems.eq(next).removeClass('deactivate').addClass('active').prevAll().addClass('complete');
                form.log('moving to step '+next);
                if (dir === 'prev') form.onPrev();
                if (dir === 'next') form.onNext();
            } else {}
            resolve();
        });
    };

    

    return SplitForm;
}