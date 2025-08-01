import { CommonModule } from '@angular/common';
import { AfterContentInit, booleanAttribute, ChangeDetectionStrategy, Component, ContentChild, ContentChildren, EventEmitter, inject, Input, NgModule, Output, QueryList, TemplateRef, ViewEncapsulation } from '@angular/core';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { BaseComponent } from 'primeng/basecomponent';
import { ButtonModule } from 'primeng/button';
import { TimesIcon } from 'primeng/icons';
import { Ripple } from 'primeng/ripple';
import { InplaceStyle } from './style/inplacestyle';

@Component({
    selector: 'p-inplacedisplay, p-inplaceDisplay',
    standalone: true,
    imports: [CommonModule],
    template: '<ng-content></ng-content>'
})
export class InplaceDisplay {}

@Component({
    selector: 'p-inplacecontent, p-inplaceContent',
    standalone: true,
    imports: [CommonModule],
    template: '<ng-content></ng-content>'
})
export class InplaceContent {}
/**
 * Inplace provides an easy to do editing and display at the same time where clicking the output displays the actual content.
 * @group Components
 */
@Component({
    selector: 'p-inplace',
    standalone: true,
    imports: [CommonModule, ButtonModule, TimesIcon, SharedModule, Ripple],
    template: `
        <div [class]="cx('display')" (click)="onActivateClick($event)" tabindex="0" role="button" (keydown)="onKeydown($event)" [ngClass]="{ 'p-disabled': disabled }" *ngIf="!active">
            <ng-content select="[pInplaceDisplay]"></ng-content>
            <ng-container *ngTemplateOutlet="displayTemplate || _displayTemplate"></ng-container>
        </div>
        <div [class]="cx('content')" *ngIf="active">
            <ng-content select="[pInplaceContent]"></ng-content>
            <ng-container *ngTemplateOutlet="contentTemplate || _contentTemplate; context: { closeCallback: onDeactivateClick.bind(this) }"></ng-container>

            <ng-container *ngIf="closable">
                <p-button *ngIf="closeIcon" type="button" [icon]="closeIcon" pRipple (click)="onDeactivateClick($event)" [attr.aria-label]="closeAriaLabel"></p-button>
                <p-button *ngIf="!closeIcon" type="button" pRipple (click)="onDeactivateClick($event)" [attr.aria-label]="closeAriaLabel">
                    <ng-template #icon>
                        <svg data-p-icon="times" *ngIf="!closeIconTemplate && !_closeIconTemplate" />
                    </ng-template>
                    <ng-template *ngTemplateOutlet="closeIconTemplate || _closeIconTemplate"></ng-template>
                </p-button>
            </ng-container>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [InplaceStyle],
    host: {
        '[attr.aria-live]': "'polite'",
        '[class]': "cn(cx('root'), styleClass)"
    }
})
export class Inplace extends BaseComponent implements AfterContentInit {
    /**
     * Whether the content is displayed or not.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) active: boolean | undefined = false;
    /**
     * Displays a button to switch back to display mode.
     * @deprecated since v20.0.0, use `closeCallback` within content template.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) closable: boolean | undefined = false;
    /**
     * When present, it specifies that the element should be disabled.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) disabled: boolean | undefined = false;
    /**
     * Allows to prevent clicking.
     * @group Props
     */
    @Input({ transform: booleanAttribute }) preventClick: boolean | undefined;
    /**
     * Class of the element.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() styleClass: string | undefined;
    /**
     * Icon to display in the close button.
     * @deprecated since v20.0.0, use `class` instead.
     * @group Props
     */
    @Input() closeIcon: string | undefined;
    /**
     * Establishes a string value that labels the close button.
     * @group Props
     */
    @Input() closeAriaLabel: string | undefined;
    /**
     * Callback to invoke when inplace is opened.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onActivate: EventEmitter<Event> = new EventEmitter<Event>();
    /**
     * Callback to invoke when inplace is closed.
     * @param {Event} event - Browser event.
     * @group Emits
     */
    @Output() onDeactivate: EventEmitter<Event> = new EventEmitter<Event>();

    hover!: boolean;
    /**
     * Display template of the element.
     * @group Templates
     */
    @ContentChild('display', { descendants: false }) displayTemplate: TemplateRef<any> | undefined;
    /**
     * Content template of the element.
     * @group Templates
     */
    @ContentChild('content', { descendants: false }) contentTemplate: TemplateRef<any> | undefined;
    /**
     * Close icon template of the element.
     * @group Templates
     */
    @ContentChild('closeicon', { descendants: false }) closeIconTemplate: TemplateRef<any> | undefined;

    _componentStyle = inject(InplaceStyle);

    onActivateClick(event: MouseEvent) {
        if (!this.preventClick) this.activate(event);
    }

    onDeactivateClick(event: MouseEvent) {
        if (!this.preventClick) this.deactivate(event);
    }
    /**
     * Activates the content.
     * @param {Event} event - Browser event.
     * @group Method
     */
    activate(event?: Event) {
        if (!this.disabled) {
            this.active = true;
            this.onActivate.emit(event);
            this.cd.markForCheck();
        }
    }
    /**
     * Deactivates the content.
     * @param {Event} event - Browser event.
     * @group Method
     */
    deactivate(event?: Event) {
        if (!this.disabled) {
            this.active = false;
            this.hover = false;
            this.onDeactivate.emit(event);
            this.cd.markForCheck();
        }
    }

    onKeydown(event: KeyboardEvent) {
        if (event.code === 'Enter') {
            this.activate(event);
            event.preventDefault();
        }
    }

    @ContentChildren(PrimeTemplate) templates: QueryList<PrimeTemplate> | undefined;

    _displayTemplate: TemplateRef<any> | undefined;

    _closeIconTemplate: TemplateRef<any> | undefined;

    _contentTemplate: TemplateRef<any> | undefined;

    ngAfterContentInit() {
        this.templates?.forEach((item) => {
            switch (item.getType()) {
                case 'display':
                    this._displayTemplate = item.template;
                    break;

                case 'closeicon':
                    this._closeIconTemplate = item.template;
                    break;

                case 'content':
                    this._contentTemplate = item.template;
                    break;
            }
        });
    }
}

@NgModule({
    imports: [Inplace, InplaceContent, InplaceDisplay, SharedModule],
    exports: [Inplace, InplaceContent, InplaceDisplay, SharedModule]
})
export class InplaceModule {}
